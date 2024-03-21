use soroban_sdk::{Address, Env, Vec};

use crate::{
    errors::Error,
    storage::{ConfigDataKey, TokenDistribution},
};

pub fn query(env: Env) -> Result<Vec<Address>, Error> {
    if !ConfigDataKey::exists(&env) {
        return Err(Error::NotInitialized);
    };
    let tokens = TokenDistribution::get_whitelisted_tokens(&env);
    Ok(tokens)
}
