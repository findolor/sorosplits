use soroban_sdk::{testutils::Address as _, vec, Address, Env};

use crate::tests::helpers::{create_splitter_with_default_shares, create_token};

#[test]
fn happy_path() {
    let env = Env::default();
    env.mock_all_auths();

    let (splitter, _) = create_splitter_with_default_shares(&env, &Address::generate(&env));

    let (_, _, token_address) = create_token(&env, &Address::generate(&env));
    splitter.update_whitelisted_tokens(&vec![&env, token_address.clone()]);

    let whitelisted_tokens = splitter.list_whitelisted_tokens();
    assert_eq!(whitelisted_tokens, vec![&env, token_address]);
}

#[test]
fn test_unauthorized() {
    let env = Env::default();

    let (splitter, _) = create_splitter_with_default_shares(&env, &Address::generate(&env));

    assert!(splitter
        .try_update_whitelisted_tokens(&vec![&env, Address::generate(&env)])
        .is_err());
}

#[test]
fn test_invalid_token() {
    let env = Env::default();
    env.mock_all_auths();

    let (splitter, _) = create_splitter_with_default_shares(&env, &Address::generate(&env));

    assert!(splitter
        .try_update_whitelisted_tokens(&vec![&env, Address::generate(&env)])
        .is_err());
}
