use soroban_sdk::{Address, Env};

use sorosplits_utils::token::get_token_client;

use crate::{
    errors::Error,
    storage::{config::ConfigDataKey, distributions::TokenAllocations},
};

pub fn query(env: Env, token_address: Address) -> Result<i128, Error> {
    if !ConfigDataKey::exists(&env) {
        return Err(Error::NotInitialized);
    };

    let token_client = get_token_client(&env, &token_address);
    let token_balance = token_client.balance(&env.current_contract_address());

    let total_allocations = TokenAllocations::get_total(&env, &token_address).unwrap_or(0);

    Ok(token_balance - total_allocations)
}
