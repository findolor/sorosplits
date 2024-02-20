use soroban_sdk::{testutils::Address as _, vec, Address, Env};

use crate::{
    errors::Error,
    storage::ShareDataKey,
    tests::helpers::{
        create_splitter, create_splitter_with_default_shares, create_splitter_with_shares,
    },
};

#[test]
fn test_happy_path() {
    let env: Env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let old_shareholder_1 = Address::generate(&env);
    let old_shareholder_2 = Address::generate(&env);
    let (splitter, _) = create_splitter_with_shares(
        &env,
        &admin,
        &vec![
            &env,
            ShareDataKey {
                shareholder: old_shareholder_1.clone(),
                share: 8050,
            },
            ShareDataKey {
                shareholder: old_shareholder_2.clone(),
                share: 1950,
            },
        ],
        &true,
    );

    let shareholder_1 = Address::generate(&env);
    let shareholder_2 = Address::generate(&env);
    let shareholder_3 = Address::generate(&env);
    let new_shares = vec![
        &env,
        ShareDataKey {
            shareholder: shareholder_1.clone(),
            share: 4260,
        },
        ShareDataKey {
            shareholder: shareholder_2.clone(),
            share: 2748,
        },
        ShareDataKey {
            shareholder: shareholder_3.clone(),
            share: 2992,
        },
    ];

    splitter.update_shares(&new_shares);

    assert_eq!(splitter.get_share(&shareholder_1), Some(4260));
    assert_eq!(splitter.get_share(&shareholder_2), Some(2748));
    assert_eq!(splitter.get_share(&shareholder_3), Some(2992));
    assert_eq!(splitter.list_shares(), new_shares);

    assert_eq!(splitter.get_share(&old_shareholder_1), None);
    assert_eq!(splitter.get_share(&old_shareholder_2), None);
}

#[test]
fn test_not_initialized() {
    let env = Env::default();
    let (splitter, _) = create_splitter(&env);

    assert_eq!(
        splitter.try_update_shares(&vec![&env]),
        Err(Ok(Error::NotInitialized))
    );
}

#[test]
fn test_unauthorized() {
    let env = Env::default();

    let admin = Address::generate(&env);
    let (splitter, _) = create_splitter_with_default_shares(&env, &admin);

    assert!(splitter.try_update_shares(&vec![&env]).is_err());
}

#[test]
fn test_low_share_count() {
    let env: Env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let (splitter, _) = create_splitter_with_default_shares(&env, &admin);

    assert_eq!(
        splitter.try_update_shares(&vec![
            &env,
            ShareDataKey {
                shareholder: Address::generate(&env),
                share: 8050,
            },
        ]),
        Err(Ok(Error::LowShareCount))
    );
}

#[test]
fn test_invalid_share_total() {
    let env: Env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let (splitter, _) = create_splitter_with_default_shares(&env, &admin);

    assert_eq!(
        splitter.try_update_shares(&vec![
            &env,
            ShareDataKey {
                shareholder: Address::generate(&env),
                share: 8050,
            },
            ShareDataKey {
                shareholder: Address::generate(&env),
                share: 8050,
            },
        ]),
        Err(Ok(Error::InvalidShareTotal))
    );

    assert_eq!(
        splitter.try_update_shares(&vec![
            &env,
            ShareDataKey {
                shareholder: Address::generate(&env),
                share: 8050,
            },
            ShareDataKey {
                shareholder: Address::generate(&env),
                share: 50,
            },
        ]),
        Err(Ok(Error::InvalidShareTotal))
    );
}
