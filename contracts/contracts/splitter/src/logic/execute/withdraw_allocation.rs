use soroban_sdk::{Address, Env};

use crate::{
    errors::Error,
    logic::helpers::get_token_client,
    storage::{ConfigDataKey, TokenDistribution},
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
    let allocation =
        TokenDistribution::get_allocation(&env, &shareholder, &token_address).unwrap_or(0);

    // Withdraw amount cannot be equal and less than 0
    if amount == 0 {
        return Err(Error::ZeroWithdrawalAmount);
    };
    // Withdraw amount cannot be greater than the allocation
    if amount > allocation {
        return Err(Error::WithdrawalAmountAboveAllocation);
    };

    if amount == allocation {
        TokenDistribution::remove_allocation(&env, &shareholder, &token_address);
    } else {
        TokenDistribution::save_allocation(&env, &shareholder, &token_address, allocation - amount);
    }

    // Transfer the tokens to the shareholder
    token_client.transfer(&env.current_contract_address(), &shareholder, &amount);

    Ok(())
}
