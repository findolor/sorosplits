use soroban_sdk::{Bytes, Env};

use crate::{errors::Error, storage::config::ConfigDataKey};

pub fn execute(env: Env, name: Bytes) -> Result<(), Error> {
    if !ConfigDataKey::exists(&env) {
        return Err(Error::NotInitialized);
    };

    // Make sure the caller is the admin
    ConfigDataKey::require_admin(&env)?;

    // Update the contract name
    ConfigDataKey::update_name(&env, name);

    Ok(())
}
