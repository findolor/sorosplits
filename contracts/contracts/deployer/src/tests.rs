#![cfg(test)]
extern crate alloc;
extern crate std;

use crate::{Deployer, DeployerClient, NetworkArg, SplitterData, SplitterInputData};
use alloc::vec;
use soroban_sdk::{
    map,
    testutils::{Address as _, AuthorizedFunction, AuthorizedInvocation},
    vec as soroban_vec,
    xdr::{
        self, ContractIdPreimage, ContractIdPreimageFromAddress, CreateContractArgs, Limits,
        ReadXdr, ScVal, Uint256,
    },
    Address, Bytes, BytesN, Env, IntoVal, Symbol, Val, Vec,
};
use sorosplits_utils::types::ShareDataKey;

// Splitter contract to be deployed
mod splitter_contract {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32-unknown-unknown/release/sorosplits_splitter.wasm"
    );
}
mod diversfier_contract {
    use super::splitter_contract::ConfigDataKey;
    use crate::tests::ContractError;
    soroban_sdk::contractimport!(
        file = "../../target/wasm32-unknown-unknown/release/sorosplits_diversifier.wasm"
    );
}
use diversfier_contract::Error as ContractError;

#[test]
fn test_deploy_from_address() {
    let env = Env::default();
    let deployer_client = DeployerClient::new(&env, &env.register_contract(None, Deployer));

    // Upload the Wasm to be deployed from the deployer contract
    // This can also be called from within a contract if needed
    let wasm_hash = env.deployer().upload_contract_wasm(splitter_contract::WASM);

    // Define a deployer address that needs to authorize the deployment
    let deployer = Address::generate(&env);

    // Deploy contract using deployer, and include an init function to call
    let salt = BytesN::from_array(&env, &[0; 32]);
    let init_fn_args: Vec<Val> = (
        deployer.clone(),
        Bytes::from_slice(&env, "Splitter Contract".as_bytes()),
        ScVal::from_xdr_base64("AAAAEAAAAAEAAAACAAAAEQAAAAEAAAACAAAADwAAAAVzaGFyZQAAAAAAAAoAAAAAAAAAAAAAAAAAAAfQAAAADwAAAAtzaGFyZWhvbGRlcgAAAAASAAAAAAAAAADpj6fg3ucLOk6Bhu//xjLZukCRXxO5Pn3xfYlxA/sWMgAAABEAAAABAAAAAgAAAA8AAAAFc2hhcmUAAAAAAAAKAAAAAAAAAAAAAAAAAAAfQAAAAA8AAAALc2hhcmVob2xkZXIAAAAAEgAAAAAAAAAAfNqRvTyoFTMCJ3LrSV1WtzDaNILzjamsvTOwQ0SQuMw=", Limits {
            depth: 100,
            len: 1000
        }).unwrap(),
        ScVal::from_xdr_base64("AAAAAAAAAAA=", Limits {
            depth: 100,
            len: 1000
        }).unwrap(),
    ).into_val(&env);
    env.mock_all_auths();
    let (contract_id, init_result) =
        deployer_client.deploy_splitter(&deployer, &wasm_hash, &salt, &init_fn_args);

    assert!(init_result.is_void());

    let expected_auth = AuthorizedInvocation {
        // Top-level authorized function is `deploy` with all the arguments
        function: AuthorizedFunction::Contract((
            deployer_client.address,
            Symbol::new(&env, "deploy_splitter"),
            (deployer.clone(), wasm_hash.clone(), salt, init_fn_args).into_val(&env),
        )),
        // From `deploy` function the 'create contract' host function has to be authorized
        sub_invocations: vec![AuthorizedInvocation {
            function: AuthorizedFunction::CreateContractHostFn(CreateContractArgs {
                contract_id_preimage: ContractIdPreimage::Address(ContractIdPreimageFromAddress {
                    address: deployer.clone().try_into().unwrap(),
                    salt: Uint256([0; 32]),
                }),
                executable: xdr::ContractExecutable::Wasm(xdr::Hash(wasm_hash.into_val(&env))),
            }),
            sub_invocations: vec![],
        }],
    };
    assert_eq!(env.auths(), vec![(deployer.clone(), expected_auth)]);

    // Invoke contract to check that it is initialized
    let client = splitter_contract::Client::new(&env, &contract_id);

    let config = client.get_config();
    assert_eq!(config.admin, deployer);
    assert_eq!(
        config.name,
        Bytes::from_slice(&env, "Splitter Contract".as_bytes())
    );
    assert_eq!(config.updatable, false);

    let shareholder1: Address = ScVal::from_xdr_base64(
        "AAAAEgAAAAAAAAAA6Y+n4N7nCzpOgYbv/8Yy2bpAkV8TuT598X2JcQP7FjI=",
        Limits {
            depth: 100,
            len: 1000,
        },
    )
    .unwrap()
    .into_val(&env);
    let shareholder2: Address = ScVal::from_xdr_base64(
        "AAAAEgAAAAAAAAAAfNqRvTyoFTMCJ3LrSV1WtzDaNILzjamsvTOwQ0SQuMw=",
        Limits {
            depth: 100,
            len: 1000,
        },
    )
    .unwrap()
    .into_val(&env);

    let shares = client.list_shares();
    assert_eq!(shares.len(), 2);
    assert_eq!(shares.get(0).unwrap().shareholder, shareholder1);
    assert_eq!(shares.get(0).unwrap().share, 2000);
    assert_eq!(shares.get(1).unwrap().shareholder, shareholder2);
    assert_eq!(shares.get(1).unwrap().share, 8000);
}

#[test]
fn test_deploy_diversifier() {
    let env = Env::default();
    env.mock_all_auths();

    let deployer_client = DeployerClient::new(&env, &env.register_contract(None, Deployer));
    let splitter_wasm_hash = env.deployer().upload_contract_wasm(splitter_contract::WASM);
    let diversifier_wasm_hash = env
        .deployer()
        .upload_contract_wasm(diversfier_contract::WASM);
    let deployer = Address::generate(&env);
    let salt = BytesN::from_array(&env, &[0; 32]);

    let splitter_init_args: Vec<Val> = (
        Bytes::from_slice(&env, "Diversifier Contract".as_bytes()),
        ScVal::from_xdr_base64("AAAAEAAAAAEAAAACAAAAEQAAAAEAAAACAAAADwAAAAVzaGFyZQAAAAAAAAoAAAAAAAAAAAAAAAAAAAfQAAAADwAAAAtzaGFyZWhvbGRlcgAAAAASAAAAAAAAAADpj6fg3ucLOk6Bhu//xjLZukCRXxO5Pn3xfYlxA/sWMgAAABEAAAABAAAAAgAAAA8AAAAFc2hhcmUAAAAAAAAKAAAAAAAAAAAAAAAAAAAfQAAAAA8AAAALc2hhcmVob2xkZXIAAAAAEgAAAAAAAAAAfNqRvTyoFTMCJ3LrSV1WtzDaNILzjamsvTOwQ0SQuMw=", Limits {
            depth: 100,
            len: 1000
        }).unwrap(),
        ScVal::from_xdr_base64("AAAAAAAAAAA=", Limits {
            depth: 100,
            len: 1000
        }).unwrap(),
    ).into_val(&env);
    let init_args: Vec<Val> = (
        deployer.clone(),
        splitter_wasm_hash.clone(),
        salt.clone(),
        true,
        splitter_init_args,
    )
        .into_val(&env);

    let (contract_id, init_result) =
        deployer_client.deploy_diversifier(&deployer, &diversifier_wasm_hash, &salt, &init_args);

    assert!(init_result.is_void());

    let expected_auth = AuthorizedInvocation {
        // Top-level authorized function is `deploy` with all the arguments
        function: AuthorizedFunction::Contract((
            deployer_client.address,
            Symbol::new(&env, "deploy_diversifier"),
            (
                deployer.clone(),
                diversifier_wasm_hash.clone(),
                salt,
                init_args,
            )
                .into_val(&env),
        )),
        // From `deploy` function the 'create contract' host function has to be authorized
        sub_invocations: vec![AuthorizedInvocation {
            function: AuthorizedFunction::CreateContractHostFn(CreateContractArgs {
                contract_id_preimage: ContractIdPreimage::Address(ContractIdPreimageFromAddress {
                    address: deployer.clone().try_into().unwrap(),
                    salt: Uint256([0; 32]),
                }),
                executable: xdr::ContractExecutable::Wasm(xdr::Hash(
                    diversifier_wasm_hash.into_val(&env),
                )),
            }),
            sub_invocations: vec![],
        }],
    };
    assert_eq!(env.auths(), vec![(deployer.clone(), expected_auth)]);

    // Invoke contract to check that it is initialized
    let client = diversfier_contract::Client::new(&env, &contract_id);

    let diversifier_config = client.get_diversifier_config();
    assert_eq!(diversifier_config.admin, deployer);
    let config = client.get_config();
    assert_eq!(config.admin, contract_id);
    assert_eq!(
        config.name,
        Bytes::from_slice(&env, "Diversifier Contract".as_bytes())
    );
    assert_eq!(config.updatable, false);

    let shareholder1: Address = ScVal::from_xdr_base64(
        "AAAAEgAAAAAAAAAA6Y+n4N7nCzpOgYbv/8Yy2bpAkV8TuT598X2JcQP7FjI=",
        Limits {
            depth: 100,
            len: 1000,
        },
    )
    .unwrap()
    .into_val(&env);
    let shareholder2: Address = ScVal::from_xdr_base64(
        "AAAAEgAAAAAAAAAAfNqRvTyoFTMCJ3LrSV1WtzDaNILzjamsvTOwQ0SQuMw=",
        Limits {
            depth: 100,
            len: 1000,
        },
    )
    .unwrap()
    .into_val(&env);

    let shares = client.list_shares();
    assert_eq!(shares.len(), 2);
    assert_eq!(shares.get(0).unwrap().shareholder, shareholder1);
    assert_eq!(shares.get(0).unwrap().share, 2000);
    assert_eq!(shares.get(1).unwrap().shareholder, shareholder2);
    assert_eq!(shares.get(1).unwrap().share, 8000);
}

#[test]
fn test_network_deploy() {
    let env = Env::default();
    env.mock_all_auths();
    // Reset the budget to unlimited
    env.budget().reset_unlimited();

    let deployer_client = DeployerClient::new(&env, &env.register_contract(None, Deployer));
    let mut wasm_hashes = map![&env];
    let splitter_wasm_hash = env.deployer().upload_contract_wasm(splitter_contract::WASM);
    wasm_hashes.set(Symbol::new(&env, "splitter"), splitter_wasm_hash);
    let diversifier_wasm_hash = env
        .deployer()
        .upload_contract_wasm(diversfier_contract::WASM);
    wasm_hashes.set(Symbol::new(&env, "diversifier"), diversifier_wasm_hash);
    let deployer = Address::generate(&env);

    let shareholder1 = Address::generate(&env);
    let shareholder2 = Address::generate(&env);
    let shareholder3 = Address::generate(&env);
    let shareholder4 = Address::generate(&env);

    let first_contract = NetworkArg {
        id: 1,
        salt: BytesN::from_array(&env, &[0; 32]),
        is_diversifier_active: false,
        splitter_data: SplitterData {
            name: Bytes::from_slice(&env, "SPLITTER 1".as_bytes()),
            shares: soroban_vec![
                &env,
                ShareDataKey {
                    shareholder: shareholder1.clone(),
                    share: 2000,
                }
                .into_val(&env),
                ShareDataKey {
                    shareholder: shareholder2.clone(),
                    share: 8000,
                }
                .into_val(&env),
            ],
            updatable: true,
        },
        external_inputs: soroban_vec![&env],
    };
    let second_contract = NetworkArg {
        id: 4,
        salt: BytesN::from_array(&env, &[1; 32]),
        is_diversifier_active: true,
        splitter_data: SplitterData {
            name: Bytes::from_slice(&env, "DIVERSIFIER 1".as_bytes()),
            shares: soroban_vec![
                &env,
                ShareDataKey {
                    shareholder: shareholder3.clone(),
                    share: 3000,
                }
                .into_val(&env),
                ShareDataKey {
                    shareholder: shareholder4.clone(),
                    share: 5000,
                }
                .into_val(&env),
            ],
            updatable: true,
        },
        external_inputs: soroban_vec![&env, SplitterInputData { id: 1, share: 2000 }],
    };
    let third_contract = NetworkArg {
        id: 10,
        salt: BytesN::from_array(&env, &[2; 32]),
        is_diversifier_active: false,
        splitter_data: SplitterData {
            name: Bytes::from_slice(&env, "SPLITTER 3".as_bytes()),
            shares: soroban_vec![
                &env,
                ShareDataKey {
                    shareholder: shareholder1.clone(),
                    share: 3000,
                }
                .into_val(&env),
                ShareDataKey {
                    shareholder: shareholder3.clone(),
                    share: 2500,
                }
                .into_val(&env),
            ],
            updatable: true,
        },
        external_inputs: soroban_vec![
            &env,
            SplitterInputData { id: 1, share: 500 },
            SplitterInputData { id: 4, share: 4000 }
        ],
    };

    let network_args = soroban_vec![&env, first_contract, second_contract, third_contract];

    let deployed_contracts = deployer_client.deploy_network(&deployer, &wasm_hashes, &network_args);

    // FIRST CONTRACT
    let client = splitter_contract::Client::new(&env, &deployed_contracts.get(1).unwrap());
    let config = client.get_config();
    assert_eq!(
        config.name,
        Bytes::from_slice(&env, "SPLITTER 1".as_bytes())
    );
    let shares = client.list_shares();
    assert_eq!(shares.len(), 2);
    assert_eq!(shares.get(0).unwrap().shareholder, shareholder1);
    assert_eq!(shares.get(1).unwrap().shareholder, shareholder2);

    // SECOND DIVERSIFIER
    let client = diversfier_contract::Client::new(&env, &deployed_contracts.get(4).unwrap());
    let config = client.get_config();
    assert_eq!(
        config.name,
        Bytes::from_slice(&env, "DIVERSIFIER 1".as_bytes())
    );
    let shares = client.list_shares();
    assert_eq!(shares.len(), 3);
    assert_eq!(
        shares.get(0).unwrap().shareholder,
        deployed_contracts.get(1).unwrap()
    );
    assert_eq!(shares.get(1).unwrap().shareholder, shareholder3);
    assert_eq!(shares.get(2).unwrap().shareholder, shareholder4);

    // THIRD SPLITTER
    let client = splitter_contract::Client::new(&env, &deployed_contracts.get(10).unwrap());
    let config = client.get_config();
    assert_eq!(
        config.name,
        Bytes::from_slice(&env, "SPLITTER 3".as_bytes())
    );
    let shares = client.list_shares();
    assert_eq!(shares.len(), 4);
    assert_eq!(
        shares.get(0).unwrap().shareholder,
        deployed_contracts.get(1).unwrap()
    );
    assert_eq!(
        shares.get(1).unwrap().shareholder,
        deployed_contracts.get(4).unwrap()
    );
    assert_eq!(shares.get(2).unwrap().shareholder, shareholder1);
    assert_eq!(shares.get(3).unwrap().shareholder, shareholder3);
}
