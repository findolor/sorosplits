use soroban_sdk::{Address, Env};

use sorosplits_utils::token::get_token_client;

use crate::{
    errors::Error,
    storage::{config::ConfigDataKey, distributions::TokenAllocations},
};

pub fn execute(
    env: Env,
    token_address: Address,
    shareholder: Address,
    amount: i128,
) -> Result<(), Error> {
    if !ConfigDataKey::exists(&env) {
        return Err(Error::NotInitialized);
    };

    // Make sure the caller is the shareholder
    shareholder.require_auth();

    let token_client = get_token_client(&env, &token_address);

    // Get the current allocation for the user - default to 0
    let allocation = TokenAllocations::get(&env, &shareholder, &token_address).unwrap_or(0);

    // Withdraw amount cannot be equal and less than 0
    if amount == 0 {
        return Err(Error::ZeroWithdrawalAmount);
    };
    // Withdraw amount cannot be greater than the allocation
    if amount > allocation {
        return Err(Error::WithdrawalAmountAboveAllocation);
    };

    if amount == allocation {
        TokenAllocations::remove(&env, &shareholder, &token_address);
    } else {
        TokenAllocations::save(&env, &shareholder, &token_address, allocation - amount);
    }

    // Transfer the tokens to the shareholder
    token_client.transfer(&env.current_contract_address(), &shareholder, &amount);

    Ok(())
}
