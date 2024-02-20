use soroban_sdk::{Address, Env};

use crate::{
    errors::Error,
    logic::helpers::get_token_client,
    storage::{AllocationDataKey, ConfigDataKey},
};

pub fn execute(
    env: Env,
    token_address: Address,
    recipient: Address,
    amount: i128,
) -> Result<(), Error> {
    if !ConfigDataKey::exists(&env) {
        return Err(Error::NotInitialized);
    };

    // Make sure the caller is the admin
    ConfigDataKey::require_admin(&env)?;

    let token_client = get_token_client(&env, &token_address);

    // Get the available token balance
    let balance = token_client.balance(&env.current_contract_address());

    // Get the total allocation for the token
    let total_allocation =
        AllocationDataKey::get_total_allocation(&env, &token_address).unwrap_or(0);

    // Calculate the unused balance that can be transferred
    let unused_balance = balance - total_allocation;

    // Transfer amount cannot be equal and less than 0
    if amount <= 0 {
        return Err(Error::ZeroTransferAmount);
    };
    // Transfer amount cannot be greater than the balance
    if amount > balance {
        return Err(Error::TransferAmountAboveBalance);
    };
    // Transfer amount cannot be greater than the unused balance
    if amount > unused_balance {
        return Err(Error::TransferAmountAboveUnusedBalance);
    };

    // Transfer the tokens to the recipient
    token_client.transfer(&env.current_contract_address(), &recipient, &amount);

    Ok(())
}
