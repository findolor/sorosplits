#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, map, vec, Address, Bytes, BytesN, Env, IntoVal, Map,
    Symbol, Val, Vec,
};
use sorosplits_utils::types::ShareDataKey;

#[contract]
pub struct Deployer;

#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub struct SplitterData {
    pub name: Bytes,
    pub shares: Vec<Val>,
    pub updatable: bool,
}

#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub struct SplitterInputData {
    id: u32,
    share: i128,
}

#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub struct NetworkArg {
    pub id: u32,
    pub is_splitter: bool,
    pub salt: BytesN<32>,
    pub splitter_data: SplitterData,
    pub external_inputs: Vec<SplitterInputData>,
}

#[contractimpl]
impl Deployer {
    /// Deploy the contract Wasm and after deployment invoke the init function
    /// of the contract with the given arguments.
    ///
    /// This has to be authorized by `deployer` (unless the `Deployer` instance
    /// itself is used as deployer). This way the whole operation is atomic
    /// and it's not possible to frontrun the contract initialization.
    ///
    /// Returns the contract ID and result of the init function.
    pub fn deploy_splitter(
        env: Env,
        deployer: Address,
        wasm_hash: BytesN<32>,
        salt: BytesN<32>,
        init_args: Vec<Val>,
    ) -> (Address, Val) {
        deployer.require_auth();

        // Deploy the contract using the uploaded Wasm with given hash.
        let deployed_address = env
            .deployer()
            .with_address(deployer, salt)
            .deploy(wasm_hash);

        // Invoke the init function with the given arguments.
        let res: Val = env.invoke_contract(
            &deployed_address,
            &Symbol::new(&env, "init_splitter"),
            init_args,
        );
        // Return the contract ID of the deployed contract and the result of
        // invoking the init result.
        (deployed_address, res)
    }

    pub fn deploy_diversifier(
        env: Env,
        deployer: Address,
        wasm_hash: BytesN<32>,
        salt: BytesN<32>,
        init_args: Vec<Val>,
    ) -> (Address, Val) {
        deployer.require_auth();

        let deployed_address = env
            .deployer()
            .with_address(deployer, salt)
            .deploy(wasm_hash);

        let res: Val = env.invoke_contract(
            &deployed_address,
            &Symbol::new(&env, "init_diversifier"),
            init_args,
        );
        (deployed_address, res)
    }

    pub fn deploy_network(
        env: Env,
        deployer: Address,
        wasm_hashes: Map<Symbol, BytesN<32>>,
        args: Vec<NetworkArg>,
    ) -> Map<u32, Address> {
        deployer.require_auth();

        let splitter_wasm_hash = wasm_hashes.get(Symbol::new(&env, "splitter")).unwrap();
        let diversifier_wasm_hash = wasm_hashes.get(Symbol::new(&env, "diversifier")).unwrap();

        // All the contract addresses
        let mut deployed_contracts: Map<u32, Address> = map![&env];
        for arg in args.iter() {
            let deployer = env
                .deployer()
                .with_address(deployer.clone(), arg.salt.clone());
            let contract_address = match arg.is_splitter {
                true => deployer.deploy(splitter_wasm_hash.clone()),
                false => deployer.deploy(diversifier_wasm_hash.clone()),
            };
            deployed_contracts.set(arg.id, contract_address);
        }

        for arg in args.iter() {
            if let Some(deployed_address) = deployed_contracts.get(arg.id) {
                let mut init_args: Vec<Val> = vec![&env];
                let init_func: Symbol = Symbol::new(
                    &env,
                    if arg.is_splitter {
                        "init_splitter"
                    } else {
                        "init_diversifier"
                    },
                );

                let mut common_splitter_args: Vec<Val> =
                    vec![&env, arg.splitter_data.name.to_val()];
                let mut share_args: Vec<Val> = vec![&env];
                for input_data in arg.external_inputs.iter() {
                    if let Some(contract_address) = deployed_contracts.get(input_data.id as u32) {
                        share_args.push_back(
                            ShareDataKey {
                                shareholder: contract_address,
                                share: input_data.share,
                            }
                            .into_val(&env),
                        );
                    }
                }
                share_args.append(&arg.splitter_data.shares);
                common_splitter_args.push_back(share_args.to_val());
                common_splitter_args.push_back(arg.splitter_data.updatable.into());

                if arg.is_splitter {
                    init_args.push_back(deployer.to_val());
                    init_args.append(&common_splitter_args);
                } else {
                    init_args.push_back(deployer.to_val());
                    init_args.push_back(splitter_wasm_hash.to_val());
                    init_args.push_back(arg.salt.to_val());
                    init_args.push_back(common_splitter_args.to_val());
                }

                let _: Val = env.invoke_contract(&deployed_address, &init_func, init_args);
            }
        }

        deployed_contracts
    }
}

mod tests;
