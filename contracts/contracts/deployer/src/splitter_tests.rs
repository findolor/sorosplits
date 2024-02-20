#![cfg(test)]
extern crate alloc;
extern crate std;

use crate::{Deployer, DeployerClient};
use alloc::vec;
use soroban_sdk::{
    symbol_short,
    testutils::{Address as _, AuthorizedFunction, AuthorizedInvocation},
    xdr::{
        self, ContractIdPreimage, ContractIdPreimageFromAddress, CreateContractArgs, Limits,
        ReadXdr, ScVal, Uint256,
    },
    Address, BytesN, Env, IntoVal, Val, Vec,
};

// Splitter contract to be deployed
mod contract {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32-unknown-unknown/release/sorosplits_splitter.wasm"
    );
}

#[test]
fn test_deploy_from_address() {
    let env = Env::default();
    let deployer_client = DeployerClient::new(&env, &env.register_contract(None, Deployer));

    // Upload the Wasm to be deployed from the deployer contract
    // This can also be called from within a contract if needed
    let wasm_hash = env.deployer().upload_contract_wasm(contract::WASM);

    // Define a deployer address that needs to authorize the deployment
    let deployer = Address::generate(&env);

    // Deploy contract using deployer, and include an init function to call
    let salt = BytesN::from_array(&env, &[0; 32]);
    let init_fn = symbol_short!("init");
    let init_fn_args: Vec<Val> = (
        deployer.clone(),
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
        deployer_client.deploy(&deployer, &wasm_hash, &salt, &init_fn, &init_fn_args);

    assert!(init_result.is_void());

    let expected_auth = AuthorizedInvocation {
        // Top-level authorized function is `deploy` with all the arguments
        function: AuthorizedFunction::Contract((
            deployer_client.address,
            symbol_short!("deploy"),
            (
                deployer.clone(),
                wasm_hash.clone(),
                salt,
                init_fn,
                init_fn_args,
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
                executable: xdr::ContractExecutable::Wasm(xdr::Hash(wasm_hash.into_val(&env))),
            }),
            sub_invocations: vec![],
        }],
    };
    assert_eq!(env.auths(), vec![(deployer.clone(), expected_auth)]);

    // Invoke contract to check that it is initialized
    let client = contract::Client::new(&env, &contract_id);

    let config = client.get_config();
    assert_eq!(config.admin, deployer);
    assert_eq!(config.mutable, false);

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
