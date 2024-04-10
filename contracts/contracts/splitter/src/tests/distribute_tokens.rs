use soroban_sdk::{testutils::Address as _, vec, Address, Bytes, Env};
use sorosplits_utils::types::ShareDataKey;

use crate::{
    errors::Error,
    tests::helpers::{
        create_splitter, create_splitter_with_default_shares, create_splitter_with_shares,
        create_token,
    },
};

#[test]
fn happy_path() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let name = Bytes::from_slice(&env, "Splitter Contract".as_bytes());
    let shareholder_1 = Address::generate(&env);
    let shareholder_2 = Address::generate(&env);

    let (splitter, splitter_address) = create_splitter_with_shares(
        &env,
        &admin,
        &name,
        &vec![
            &env,
            ShareDataKey {
                shareholder: shareholder_1.clone(),
                share: 8050,
            },
            ShareDataKey {
                shareholder: shareholder_2.clone(),
                share: 1950,
            },
        ],
        &true,
    );

    let token_admin = Address::generate(&env);
    let (_, sudo_token, token_address) = create_token(&env, &token_admin);
    splitter.update_whitelisted_tokens(&vec![&env, token_address.clone()]);

    sudo_token.mint(&splitter_address, &1_000_000_000);

    splitter.distribute_tokens(&token_address, &1_000_000_000);

    let allocation_1 = splitter.get_allocation(&shareholder_1, &token_address);
    assert_eq!(allocation_1, 805_000_000);
    let allocation_2 = splitter.get_allocation(&shareholder_2, &token_address);
    assert_eq!(allocation_2, 195_000_000);
}

#[test]
fn test_not_initialized() {
    let env = Env::default();
    let (splitter, _) = create_splitter(&env);

    assert_eq!(
        splitter.try_distribute_tokens(&Address::generate(&env), &1),
        Err(Ok(Error::NotInitialized))
    );
}

#[test]
fn test_unauthorized() {
    let env = Env::default();
    let (splitter, _) = create_splitter(&env);

    let token_admin = Address::generate(&env);
    let (_, _, token_address) = create_token(&env, &token_admin);

    assert!(splitter.try_distribute_tokens(&token_address, &1).is_err());
}

#[test]
fn test_zero_token_balance() {
    let env = Env::default();
    env.mock_all_auths();

    let (splitter, _) = create_splitter_with_default_shares(&env, &Address::generate(&env));

    let token_admin = Address::generate(&env);
    let (_, _, token_address) = create_token(&env, &token_admin);
    splitter.update_whitelisted_tokens(&vec![&env, token_address.clone()]);

    assert_eq!(
        splitter.try_distribute_tokens(&token_address, &0),
        Err(Ok(Error::ZeroTransferAmount))
    );
}

#[test]
fn test_zero_distribution_amount() {
    let env = Env::default();
    env.mock_all_auths();

    let (splitter, splitter_address) =
        create_splitter_with_default_shares(&env, &Address::generate(&env));

    let token_admin = Address::generate(&env);
    let (_, sudo_token, token_address) = create_token(&env, &token_admin);
    splitter.update_whitelisted_tokens(&vec![&env, token_address.clone()]);

    sudo_token.mint(&splitter_address, &1_000_000_000);

    assert_eq!(
        splitter.try_distribute_tokens(&token_address, &0),
        Err(Ok(Error::ZeroTransferAmount))
    );
}

#[test]
fn test_distribution_amount_above_balance() {
    let env = Env::default();
    env.mock_all_auths();

    let (splitter, splitter_address) =
        create_splitter_with_default_shares(&env, &Address::generate(&env));

    let token_admin = Address::generate(&env);
    let (_, sudo_token, token_address) = create_token(&env, &token_admin);
    splitter.update_whitelisted_tokens(&vec![&env, token_address.clone()]);

    sudo_token.mint(&splitter_address, &1_000_000);

    assert_eq!(
        splitter.try_distribute_tokens(&token_address, &2_000_000),
        Err(Ok(Error::InsufficientBalance))
    );
}

#[test]
fn test_token_not_whitelisted() {
    let env = Env::default();
    env.mock_all_auths();

    let (splitter, _) = create_splitter_with_default_shares(&env, &Address::generate(&env));

    let token_admin = Address::generate(&env);
    let (_, _, token_address) = create_token(&env, &token_admin);

    assert_eq!(
        splitter.try_distribute_tokens(&token_address, &1000),
        Err(Ok(Error::TokenNotWhitelisted))
    );
}
