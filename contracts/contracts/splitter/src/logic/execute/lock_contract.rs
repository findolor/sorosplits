use soroban_sdk::Env;

use crate::{errors::Error, storage::ConfigDataKey};

pub fn execute(env: Env) -> Result<(), Error> {
    if !ConfigDataKey::exists(&env) {
        return Err(Error::NotInitialized);
    };

    // Make sure the caller is the admin
    ConfigDataKey::require_admin(&env)?;

    // Update the contract configuration
    ConfigDataKey::lock_contract(&env);

    Ok(())
}
