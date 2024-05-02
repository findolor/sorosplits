use soroban_sdk::{Bytes, Env};

use crate::{errors::Error, storage::config::ConfigDataKey};

pub fn execute(env: Env, name: Bytes) -> Result<(), Error> {
    let config = ConfigDataKey::get(&env)?;

    // Make sure the caller is the admin
    config.clone().require_admin();

    // Update the contract name
    config.update_name(&env, name);

    Ok(())
}
