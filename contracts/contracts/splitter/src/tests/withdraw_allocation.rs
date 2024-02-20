use soroban_sdk::{testutils::Address as _, Address, Env};

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
    let share_data = get_default_share_data(&env);
    let shareholder = share_data.get(0).unwrap().shareholder;

    let (splitter, splitter_address) =
        create_splitter_with_shares(&env, &admin, &share_data, &true);

    let token_admin = Address::generate(&env);
    let (token, sudo_token, token_address) = create_token(&env, &token_admin);

    sudo_token.mint(&splitter_address, &1_000_000_000);
    splitter.distribute_tokens(&token_address);

    splitter.withdraw_allocation(&token_address, &shareholder, &500_000_000);
    assert_eq!(
        splitter.get_allocation(&shareholder, &token_address),
        305_000_000
    );
    assert_eq!(token.balance(&shareholder), 500_000_000);

    splitter.withdraw_allocation(&token_address, &shareholder, &305_000_000);
    assert_eq!(splitter.get_allocation(&shareholder, &token_address), 0);
    assert_eq!(token.balance(&shareholder), 805_000_000);
}

#[test]
fn test_not_initialized() {
    let env = Env::default();
    let (splitter, _) = create_splitter(&env);

    assert_eq!(
        splitter.try_withdraw_allocation(&Address::generate(&env), &Address::generate(&env), &1),
        Err(Ok(Error::NotInitialized))
    );
}

#[test]
fn test_unauthorized() {
    let env = Env::default();
    let (splitter, _) = create_splitter(&env);

    assert!(splitter
        .try_withdraw_allocation(&Address::generate(&env), &Address::generate(&env), &1)
        .is_err());
}

#[test]
fn test_zero_withdraw_amount() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let (splitter, _) =
        create_splitter_with_shares(&env, &admin, &get_default_share_data(&env), &true);

    assert_eq!(
        splitter.try_withdraw_allocation(&Address::generate(&env), &Address::generate(&env), &0),
        Err(Ok(Error::ZeroWithdrawalAmount))
    );
}

#[test]
fn test_withdrawal_amount_above_allocation() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let (splitter, splitter_address) =
        create_splitter_with_shares(&env, &admin, &get_default_share_data(&env), &true);

    let token_admin = Address::generate(&env);
    let (_, sudo_token, token_address) = create_token(&env, &token_admin);

    sudo_token.mint(&splitter_address, &1_000_000_000);
    splitter.distribute_tokens(&token_address);

    assert_eq!(
        splitter.try_withdraw_allocation(
            &Address::generate(&env),
            &Address::generate(&env),
            &1_000_000_000
        ),
        Err(Ok(Error::WithdrawalAmountAboveAllocation))
    );
}
