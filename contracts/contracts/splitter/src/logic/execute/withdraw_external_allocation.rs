use soroban_sdk::{
    auth::{ContractContext, InvokerContractAuthEntry, SubContractInvocation},
    vec, Address, Env, IntoVal, Symbol,
};

use crate::{errors::Error, storage::config::ConfigDataKey};

mod external_splitter_contract {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32-unknown-unknown/release/sorosplits_splitter.wasm",
    );
}
use external_splitter_contract::Client as SplitterClient;

pub fn execute(
    env: Env,
    splitter_address: Address,
    token_address: Address,
    amount: i128,
) -> Result<(), Error> {
    if !ConfigDataKey::exists(&env) {
        return Err(Error::NotInitialized);
    };

    ConfigDataKey::require_admin(&env)?;

    env.authorize_as_current_contract(vec![
        &env,
        InvokerContractAuthEntry::Contract(SubContractInvocation {
            context: ContractContext {
                contract: token_address.clone(),
                fn_name: Symbol::new(&env, "transfer"),
                args: (
                    env.current_contract_address(),
                    splitter_address.clone(),
                    amount,
                )
                    .into_val(&env),
            },
            sub_invocations: vec![&env],
        }),
    ]);

    let splitter_client = SplitterClient::new(&env, &splitter_address);
    splitter_client.withdraw_allocation(&token_address, &env.current_contract_address(), &amount);

    Ok(())
}
