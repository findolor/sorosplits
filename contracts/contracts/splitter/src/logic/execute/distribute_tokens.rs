use soroban_fixed_point_math::FixedPoint;
use soroban_sdk::{Address, Env};

use sorosplits_utils::token::get_token_client;

use crate::{
    errors::Error,
    storage::{
        config::ConfigDataKey,
        distributions::{TokenAllocations, WhitelistedTokens},
        recipients::ShareDataKey,
    },
};

pub fn execute(env: Env, token_address: Address, amount: i128) -> Result<(), Error> {
    if !ConfigDataKey::exists(&env) {
        return Err(Error::NotInitialized);
    };

    // Make sure the caller is the admin
    ConfigDataKey::require_admin(&env)?;

    if !WhitelistedTokens::check_token_address(&env, &token_address) {
        return Err(Error::TokenNotWhitelisted);
    };

    let token_client = get_token_client(&env, &token_address);

    // Get the available token balance
    let balance = token_client.balance(&env.current_contract_address());

    // Check for amount errors
    if amount <= 0 || balance <= 0 {
        return Err(Error::ZeroTransferAmount);
    }
    if amount > balance {
        return Err(Error::InsufficientBalance);
    }

    // Get the shareholders vector
    let shareholders = ShareDataKey::get_shareholders(&env);

    // For each shareholder, calculate the amount of tokens to distribute
    for shareholder in shareholders.iter() {
        if let Some(ShareDataKey { share, .. }) = ShareDataKey::get_share(&env, &shareholder) {
            // Calculate the amount of tokens to distribute
            let shareholder_allocation = amount.fixed_mul_floor(share, 10000).unwrap_or(0);

            if shareholder_allocation > 0 {
                // Get the current allocation for the user - default to 0
                let allocation =
                    TokenAllocations::get(&env, &shareholder, &token_address).unwrap_or(0);

                // Update the allocation with the new amount
                TokenAllocations::save(
                    &env,
                    &shareholder,
                    &token_address,
                    allocation + shareholder_allocation,
                );
            }
        };
    }

    Ok(())
}
