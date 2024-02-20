use soroban_sdk::{testutils::Address as _, Address, Env};

use crate::{
    errors::Error,
    tests::helpers::{create_splitter, create_splitter_with_default_shares},
};

#[test]
fn happy_path() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let (splitter, _) = create_splitter_with_default_shares(&env, &admin);

    splitter.lock_contract();

    assert_eq!(splitter.get_config().mutable, false);
}

#[test]
fn test_not_initialized() {
    let env = Env::default();
    let (splitter, _) = create_splitter(&env);

    assert_eq!(splitter.try_lock_contract(), Err(Ok(Error::NotInitialized)));
}

#[test]
fn test_unauthorized() {
    let env = Env::default();

    let admin = Address::generate(&env);
    let (splitter, _) = create_splitter_with_default_shares(&env, &admin);

    assert!(splitter.try_lock_contract().is_err());
}
