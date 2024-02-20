use soroban_fixed_point_math::FixedPoint;
use soroban_sdk::{Address, Env};

use crate::{
    errors::Error,
    logic::helpers::get_token_client,
    storage::{AllocationDataKey, ConfigDataKey, ShareDataKey},
};

pub fn execute(env: Env, token_address: Address) -> Result<(), Error> {
    if !ConfigDataKey::exists(&env) {
        return Err(Error::NotInitialized);
    };

    // Make sure the caller is the admin
    ConfigDataKey::require_admin(&env)?;

    let token_client = get_token_client(&env, &token_address);

    // Get the available token balance
    let balance = token_client.balance(&env.current_contract_address());

    // Get the shareholders vector
    let shareholders = ShareDataKey::get_shareholders(&env);

    // For each shareholder, calculate the amount of tokens to distribute
    for shareholder in shareholders.iter() {
        if let Some(ShareDataKey { share, .. }) = ShareDataKey::get_share(&env, &shareholder) {
            // Calculate the amount of tokens to distribute
            let amount = balance.fixed_mul_floor(share, 10000).unwrap_or(0);

            if amount > 0 {
                // Get the current allocation for the user - default to 0
                let allocation =
                    AllocationDataKey::get_allocation(&env, &shareholder, &token_address)
                        .unwrap_or(0);

                // Update the allocation with the new amount
                AllocationDataKey::save_allocation(
                    &env,
                    &shareholder,
                    &token_address,
                    allocation + amount,
                );
            }
        };
    }

    Ok(())
}
