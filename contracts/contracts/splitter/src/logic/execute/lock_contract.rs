use soroban_sdk::Env;

use crate::{errors::Error, storage::config::ConfigDataKey};

pub fn execute(env: Env) -> Result<(), Error> {
    let config = ConfigDataKey::get(&env)?;

    // Make sure the caller is the admin
    config.clone().require_admin();

    // Update the contract configuration
    config.lock_contract(&env);

    Ok(())
}
