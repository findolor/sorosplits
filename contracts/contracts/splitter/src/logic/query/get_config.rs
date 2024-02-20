use soroban_sdk::Env;

use crate::{errors::Error, storage::ConfigDataKey};

pub fn query(env: Env) -> Result<ConfigDataKey, Error> {
    if !ConfigDataKey::exists(&env) {
        return Err(Error::NotInitialized);
    };
    Ok(ConfigDataKey::get(&env).unwrap())
}
