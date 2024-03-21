use soroban_sdk::{Address, Env};

use crate::{
    errors::Error,
    storage::{ConfigDataKey, TokenDistribution},
};

pub fn query(env: Env, shareholder: Address, token: Address) -> Result<i128, Error> {
    if !ConfigDataKey::exists(&env) {
        return Err(Error::NotInitialized);
    };
    Ok(TokenDistribution::get_allocation(&env, &shareholder, &token).unwrap_or(0))
}
