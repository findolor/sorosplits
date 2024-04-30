use soroban_sdk::{testutils::Address as _, vec, Address, Bytes, Env};
use sorosplits_utils::types::ShareDataKey;

use crate::{
    errors::Error,
    tests::helpers::{
        create_splitter, create_splitter_with_shares, create_token, get_default_share_data,
    },
};

#[test]
fn happy_path() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let name = Bytes::from_slice(&env, "Splitter Contract".as_bytes());
    let share_data = get_default_share_data(&env);

    let (splitter1, splitter1_address) =
        create_splitter_with_shares(&env, &admin, &name, &share_data, &true);

    let (splitter2, splitter2_address) = create_splitter_with_shares(
        &env,
        &admin,
        &name,
        &vec![
            &env,
            ShareDataKey {
                shareholder: splitter1_address.clone(),
                share: 6000,
            },
            ShareDataKey {
                shareholder: Address::generate(&env),
                share: 3000,
            },
            ShareDataKey {
                shareholder: Address::generate(&env),
                share: 1000,
            },
        ],
        &true,
    );

    let token_admin = Address::generate(&env);
    let (token, sudo_token, token_address) = create_token(&env, &token_admin);
    splitter2.update_whitelisted_tokens(&vec![&env, token_address.clone()]);

    sudo_token.mint(&splitter2_address, &1_000_000_000);
    splitter2.distribute_tokens(&token_address, &1_000_000_000);

    assert_eq!(
        splitter2.get_allocation(&splitter1_address, &token_address),
        600_000_000
    );
    splitter1.withdraw_external_allocation(&splitter2_address, &token_address, &120_000_000);
    assert_eq!(
        splitter2.get_allocation(&splitter1_address, &token_address),
        480_000_000
    );
    assert_eq!(token.balance(&splitter1_address), 120_000_000);

    splitter1.withdraw_external_allocation(&splitter2_address, &token_address, &480_000_000);
    assert_eq!(
        splitter2.get_allocation(&splitter1_address, &token_address),
        0
    );
    assert_eq!(token.balance(&splitter1_address), 600_000_000);
}

#[test]
fn test_not_initialized() {
    let env = Env::default();
    let (splitter, _) = create_splitter(&env);

    assert_eq!(
        splitter.try_withdraw_external_allocation(
            &Address::generate(&env),
            &Address::generate(&env),
            &1
        ),
        Err(Ok(Error::NotInitialized))
    );
}
