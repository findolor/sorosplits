use soroban_sdk::{testutils::Address as _, vec, Address, Bytes, Env};
use sorosplits_utils::types::ShareDataKey;

use crate::{errors::Error, tests::helpers::create_splitter};

#[test]
fn happy_path() {
    let env: Env = Env::default();
    let (splitter, _) = create_splitter(&env);

    let admin = Address::generate(&env);
    let name = Bytes::from_slice(&env, "Splitter Contract".as_bytes());
    let shareholder_1 = Address::generate(&env);
    let shareholder_2 = Address::generate(&env);
    let shares = vec![
        &env,
        ShareDataKey {
            shareholder: shareholder_1.clone(),
            share: 8050,
        },
        ShareDataKey {
            shareholder: shareholder_2.clone(),
            share: 1950,
        },
    ];

    splitter.init_splitter(&admin, &name, &shares, &true);

    assert_eq!(splitter.get_share(&shareholder_1), Some(8050));
    assert_eq!(splitter.get_share(&shareholder_2), Some(1950));
    assert_eq!(splitter.list_shares(), shares);
}

#[test]
fn test_already_initialized() {
    let env: Env = Env::default();
    let (splitter, _) = create_splitter(&env);

    let admin = Address::generate(&env);
    let name = Bytes::from_slice(&env, "Splitter Contract".as_bytes());
    let shares = vec![
        &env,
        ShareDataKey {
            shareholder: Address::generate(&env),
            share: 8050,
        },
        ShareDataKey {
            shareholder: Address::generate(&env),
            share: 1950,
        },
    ];
    splitter.init_splitter(&admin, &name, &shares, &true);

    assert_eq!(
        splitter.try_init_splitter(&admin, &name, &shares, &true),
        Err(Ok(Error::AlreadyInitialized))
    );
}

#[test]
fn test_low_share_count() {
    let env: Env = Env::default();
    let (splitter, _) = create_splitter(&env);

    let admin = Address::generate(&env);
    let name = Bytes::from_slice(&env, "Splitter Contract".as_bytes());
    let shares = vec![
        &env,
        ShareDataKey {
            shareholder: Address::generate(&env),
            share: 8050,
        },
    ];

    assert_eq!(
        splitter.try_init_splitter(&admin, &name, &shares, &true),
        Err(Ok(Error::LowShareCount))
    );
}

#[test]
fn test_invalid_share_total() {
    let env: Env = Env::default();
    let (splitter, _) = create_splitter(&env);

    let admin = Address::generate(&env);
    let name = Bytes::from_slice(&env, "Splitter Contract".as_bytes());

    assert_eq!(
        splitter.try_init_splitter(
            &admin,
            &name,
            &vec![
                &env,
                ShareDataKey {
                    shareholder: Address::generate(&env),
                    share: 8050,
                },
                ShareDataKey {
                    shareholder: Address::generate(&env),
                    share: 8050,
                },
            ],
            &true
        ),
        Err(Ok(Error::InvalidShareTotal))
    );

    assert_eq!(
        splitter.try_init_splitter(
            &admin,
            &name,
            &vec![
                &env,
                ShareDataKey {
                    shareholder: Address::generate(&env),
                    share: 8050,
                },
                ShareDataKey {
                    shareholder: Address::generate(&env),
                    share: 50,
                },
            ],
            &true
        ),
        Err(Ok(Error::InvalidShareTotal))
    );
}
