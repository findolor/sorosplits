use soroban_sdk::{testutils::Address as _, Address, Bytes, Env};

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

    let new_name = Bytes::from_slice(&env, "New Splitter Contract".as_bytes());

    splitter.update_name(&new_name);

    assert_eq!(splitter.get_config().name, new_name);
}

#[test]
fn test_not_initialized() {
    let env = Env::default();
    let (splitter, _) = create_splitter(&env);

    assert_eq!(
        splitter.try_update_name(&Bytes::from_slice(&env, "New Splitter Contract".as_bytes())),
        Err(Ok(Error::NotInitialized))
    );
}

#[test]
fn test_unauthorized() {
    let env = Env::default();

    let admin = Address::generate(&env);
    let (splitter, _) = create_splitter_with_default_shares(&env, &admin);

    assert!(splitter
        .try_update_name(&Bytes::from_slice(&env, "New Splitter Contract".as_bytes()))
        .is_err());
}
