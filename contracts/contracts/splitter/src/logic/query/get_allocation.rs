use soroban_sdk::{Address, Env};

use crate::{
    errors::Error,
    storage::{config::ConfigDataKey, distributions::TokenAllocations},
};

pub fn query(env: Env, shareholder: Address, token: Address) -> Result<i128, Error> {
    if !ConfigDataKey::exists(&env) {
        return Err(Error::NotInitialized);
    };
    Ok(TokenAllocations::get(&env, &shareholder, &token).unwrap_or(0))
}
