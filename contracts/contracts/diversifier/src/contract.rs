use soroban_sdk::{
    auth::{ContractContext, InvokerContractAuthEntry, SubContractInvocation},
    contract, contractimpl, contractmeta, vec, Address, Bytes, BytesN, Env, Error, IntoVal, String,
    Symbol, Val, Vec,
};
use sorosplits_utils::token::{check_token, get_token_client};

use crate::{
    errors::Error as ContractError,
    storage::{config::DiversifierConfig, swaps::DiversifierWhitelistedSwapTokens},
};

mod splitter_contract {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32-unknown-unknown/release/sorosplits_splitter.wasm",
    );
}
use splitter_contract::{ConfigDataKey, Contract as SplitterContract, ShareDataKey};

mod soroswap_router {
    soroban_sdk::contractimport!(file = "../../wasm_external/soroswap_router.optimized.wasm",);
}
use soroswap_router::Client as SoroswapRouterClient;
mod soroswap_pair {
    soroban_sdk::contractimport!(file = "../../wasm_external/soroswap_pair.optimized.wasm",);
}
use soroswap_pair::Client as SoroswapPairClient;

// TESTNET
const SOROSWAP_ROUTER_ADDRESS: &str = "CDGHOS7DDZ7DB24J7TMFDEAIR7LS7GLMT5J5KEZMUF6MSX5BFHCXQIB3";

contractmeta!(
    key = "desc",
    val =
        "The Diversifier contract is used to swap tokens and distribute them to the shareholders."
);

pub trait DiversifierTrait {
    /// Initializes the diversifier contract.
    ///
    /// This method can only be called once.
    /// It deploys the splitter contract and initializes it with the given arguments.
    ///
    /// # Arguments
    ///
    /// * `wasm_hash` - The hash of the Wasm code of the splitter contract.
    /// * `salt` - The salt to use for the deployment of the splitter contract.
    /// * `is_active` - Whether the diversifier should be active after initialization.
    /// * `splitter_init_args` - The arguments to pass to the init function of the splitter contract.
    fn init_diversifier(
        env: Env,
        admin: Address,
        wasm_hash: BytesN<32>,
        salt: BytesN<32>,
        is_active: bool,
        splitter_init_args: Vec<Val>,
    ) -> Result<(), ContractError>;

    /// Updates the whitelisted swap tokens for a token.
    ///
    /// # Arguments
    ///
    /// * `token_address` - The address of the token to update the swap tokens for.
    /// * `swap_tokens` - The list of swap tokens to whitelist.
    fn update_whitelisted_swap_tokens(
        env: Env,
        token_address: Address,
        swap_tokens: Vec<Address>,
    ) -> Result<(), ContractError>;

    /// Swaps tokens and distributes them to the shareholders.
    ///
    /// # Arguments
    ///
    /// * `token_address` - The address of the token to swap.
    /// * `swap_path` - The swap path to use for the swap. The first element is the token to swap, the last element is the token to receive.
    /// * `amount` - The amount of tokens to swap.
    fn swap_and_distribute_tokens(
        env: Env,
        swap_path: Vec<Address>,
        amount: i128,
    ) -> Result<(), ContractError>;

    /// Toggles the diversifier active state.
    fn toggle_diversifier(env: Env) -> Result<(), ContractError>;

    /// Gets the contract configuration.
    ///
    /// ## Returns
    ///
    /// * `DiversifierConfig` - The contract configuration
    fn get_diversifier_config(env: Env) -> Result<DiversifierConfig, ContractError>;

    /// Lists the whitelisted swap tokens for a token.
    ///
    /// # Arguments
    ///
    /// * `token_address` - The address of the token to list the whitelisted swap tokens for.
    fn list_whitelisted_swap_tokens(
        env: Env,
        token_address: Address,
    ) -> Result<Vec<Address>, ContractError>;
}

#[contract]
pub struct Diversifier;

#[contractimpl]
impl DiversifierTrait for Diversifier {
    fn init_diversifier(
        env: Env,
        admin: Address,
        wasm_hash: BytesN<32>,
        salt: BytesN<32>,
        is_active: bool,
        splitter_init_args: Vec<Val>,
    ) -> Result<(), ContractError> {
        let args: Vec<Val> = vec![
            &env,
            env.current_contract_address().to_val(),
            splitter_init_args.get(0).unwrap(),
            splitter_init_args.get(1).unwrap(),
            splitter_init_args.get(2).unwrap(),
        ];

        let splitter_address = env.deployer().with_current_contract(salt).deploy(wasm_hash);
        env.invoke_contract::<Val>(&splitter_address, &Symbol::new(&env, "init_splitter"), args);

        DiversifierConfig::init(&env, admin, splitter_address, is_active);

        Ok(())
    }

    fn update_whitelisted_swap_tokens(
        env: Env,
        token_address: Address,
        swap_tokens: Vec<Address>,
    ) -> Result<(), ContractError> {
        DiversifierConfig::get(&env)?.require_admin()?;

        for token_address in swap_tokens.iter() {
            check_token(&env, &token_address);
        }

        DiversifierWhitelistedSwapTokens::set(&env, token_address, swap_tokens);

        Ok(())
    }

    fn swap_and_distribute_tokens(
        env: Env,
        swap_path: Vec<Address>,
        amount: i128,
    ) -> Result<(), ContractError> {
        let config = DiversifierConfig::get(&env)?;
        config.require_admin()?;
        config.require_diversifier_active()?;

        // Swap path must have at least 2 elements
        if swap_path.len() < 2 {
            return Err(ContractError::InvalidSwapPath);
        };

        let token_address = swap_path.get(0).unwrap();
        let swap_token_address = swap_path.last().unwrap();

        if !DiversifierWhitelistedSwapTokens::is_swap_token_valid(
            &env,
            &token_address,
            &swap_token_address,
        ) {
            return Err(ContractError::InvalidSwapToken);
        }

        let token_client = get_token_client(&env, &token_address);

        let token_balance = token_client.balance(&env.current_contract_address());
        if token_balance == 0 || amount > token_balance {
            return Err(ContractError::InsufficientTokenBalance);
        }

        let splitter_client = splitter_contract::Client::new(&env, &config.splitter_address);
        let soroswap_router_client = SoroswapRouterClient::new(
            &env,
            &Address::from_string(&String::from_str(&env, &SOROSWAP_ROUTER_ADDRESS)),
        );

        let pair_contract_address =
            soroswap_router_client.router_pair_for(&token_address, &swap_token_address);
        let soroswap_pair_client = SoroswapPairClient::new(&env, &pair_contract_address);

        // Get the reserves of the tokens
        let (reserve_in, reserve_out) = soroswap_pair_client.get_reserves();

        // Get the maximum amount of tokens that will be received
        let max_amount_out =
            soroswap_router_client.router_get_amount_out(&amount, &reserve_in, &reserve_out);

        // Authorize token transfer for the current contract
        // Without this tokens cannot be transferred from the current contract to the pair contract
        env.authorize_as_current_contract(vec![
            &env,
            InvokerContractAuthEntry::Contract(SubContractInvocation {
                context: ContractContext {
                    contract: token_address,
                    fn_name: Symbol::new(&env, "transfer"),
                    args: (
                        env.current_contract_address(),
                        pair_contract_address,
                        amount,
                    )
                        .into_val(&env),
                },
                sub_invocations: vec![&env],
            }),
        ]);

        // Swap the tokens
        let res = soroswap_router_client.swap_exact_tokens_for_tokens(
            &amount,
            &max_amount_out,
            &swap_path,
            &env.current_contract_address(),
            &u64::MAX,
        );
        let total_swapped_amount = res.last().unwrap();

        // TODO: TX will not pass if we uncomment these
        // Max CPU instructions limit is 100M and this will exceed it

        // Transfer the swapped tokens to the splitter contract
        get_token_client(&env, &swap_token_address).transfer(
            &env.current_contract_address(),
            &config.splitter_address,
            &total_swapped_amount,
        );

        // Distribute the swapped tokens
        splitter_client.distribute_tokens(&swap_token_address, &total_swapped_amount);

        Ok(())
    }

    fn toggle_diversifier(env: Env) -> Result<(), ContractError> {
        DiversifierConfig::get(&env)?.require_admin()?;
        DiversifierConfig::toggle_diversifier_active(&env)?;
        Ok(())
    }

    fn get_diversifier_config(env: Env) -> Result<DiversifierConfig, ContractError> {
        Ok(DiversifierConfig::get(&env).unwrap())
    }

    fn list_whitelisted_swap_tokens(
        env: Env,
        token_address: Address,
    ) -> Result<Vec<Address>, ContractError> {
        Ok(DiversifierWhitelistedSwapTokens::get(&env, &token_address))
    }
}

#[contractimpl]
impl SplitterContract for Diversifier {
    fn init_splitter(
        _env: Env,
        _admin: Address,
        _name: Bytes,
        _shares: Vec<ShareDataKey>,
        _updatable: bool,
    ) -> Result<(), Error> {
        Err(ContractError::NotAllowed.into())
    }
    fn update_whitelisted_tokens(env: Env, tokens: Vec<Address>) -> Result<(), Error> {
        let config = DiversifierConfig::get(&env)?;
        config.require_admin()?;

        splitter_contract::Client::new(&env, &config.splitter_address)
            .update_whitelisted_tokens(&tokens);
        Ok(())
    }
    fn transfer_tokens(
        env: Env,
        token_address: Address,
        recipient: Address,
        amount: i128,
    ) -> Result<(), Error> {
        let config = DiversifierConfig::get(&env)?;
        config.require_admin()?;

        splitter_contract::Client::new(&env, &config.splitter_address).transfer_tokens(
            &token_address,
            &recipient,
            &amount,
        );
        Ok(())
    }
    fn distribute_tokens(env: Env, token_address: Address, amount: i128) -> Result<(), Error> {
        let config = DiversifierConfig::get(&env)?;
        config.require_admin()?;

        // Only allow distribution if the diversifier is inactive
        if config.diversifier_active {
            return Err(ContractError::NotAllowed.into());
        }

        splitter_contract::Client::new(&env, &config.splitter_address)
            .distribute_tokens(&token_address, &amount);
        Ok(())
    }
    fn update_shares(env: Env, shares: Vec<ShareDataKey>) -> Result<(), Error> {
        let config = DiversifierConfig::get(&env)?;
        config.require_admin()?;

        splitter_contract::Client::new(&env, &config.splitter_address).update_shares(&shares);
        Ok(())
    }
    fn lock_contract(env: Env) -> Result<(), Error> {
        let config = DiversifierConfig::get(&env)?;
        config.require_admin()?;

        splitter_contract::Client::new(&env, &config.splitter_address).lock_contract();
        Ok(())
    }
    fn withdraw_allocation(
        env: Env,
        token_address: Address,
        shareholder: Address,
        amount: i128,
    ) -> Result<(), Error> {
        let splitter_address = DiversifierConfig::get(&env)?.splitter_address;
        splitter_contract::Client::new(&env, &splitter_address).withdraw_allocation(
            &token_address,
            &shareholder,
            &amount,
        );
        Ok(())
    }
    fn update_name(env: Env, name: Bytes) -> Result<(), Error> {
        let config = DiversifierConfig::get(&env)?;
        config.require_admin()?;

        splitter_contract::Client::new(&env, &config.splitter_address).update_name(&name);
        Ok(())
    }
    fn get_unused_tokens(env: Env, token_address: Address) -> Result<i128, Error> {
        let splitter_address = DiversifierConfig::get(&env)?.splitter_address;
        Ok(splitter_contract::Client::new(&env, &splitter_address)
            .get_unused_tokens(&token_address))
    }
    fn get_share(env: Env, shareholder: Address) -> Result<Option<i128>, Error> {
        let splitter_address = DiversifierConfig::get(&env)?.splitter_address;
        Ok(splitter_contract::Client::new(&env, &splitter_address).get_share(&shareholder))
    }
    fn list_shares(env: Env) -> Result<Vec<ShareDataKey>, Error> {
        let splitter_address = DiversifierConfig::get(&env)?.splitter_address;
        Ok(splitter_contract::Client::new(&env, &splitter_address).list_shares())
    }
    fn get_config(env: Env) -> Result<ConfigDataKey, Error> {
        let splitter_address = DiversifierConfig::get(&env)?.splitter_address;
        Ok(splitter_contract::Client::new(&env, &splitter_address).get_config())
    }
    fn get_allocation(env: Env, shareholder: Address, token: Address) -> Result<i128, Error> {
        let splitter_address = DiversifierConfig::get(&env)?.splitter_address;
        Ok(splitter_contract::Client::new(&env, &splitter_address)
            .get_allocation(&shareholder, &token))
    }
    fn list_whitelisted_tokens(env: Env) -> Result<Vec<Address>, Error> {
        let splitter_address = DiversifierConfig::get(&env)?.splitter_address;
        Ok(splitter_contract::Client::new(&env, &splitter_address).list_whitelisted_tokens())
    }
}
