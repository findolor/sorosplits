use soroban_sdk::{Address, Env, Vec};

use crate::{
    errors::Error,
    storage::{config::ConfigDataKey, distributions::WhitelistedTokens},
};

pub fn query(env: Env) -> Result<Vec<Address>, Error> {
    if !ConfigDataKey::exists(&env) {
        return Err(Error::NotInitialized);
    };
    let tokens = WhitelistedTokens::get_list(&env);
    Ok(tokens)
}
