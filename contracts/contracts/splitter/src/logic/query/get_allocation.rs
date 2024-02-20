use soroban_sdk::{Address, Env};

use crate::{
    errors::Error,
    storage::{AllocationDataKey, ConfigDataKey},
};

pub fn query(env: Env, shareholder: Address, token: Address) -> Result<i128, Error> {
    if !ConfigDataKey::exists(&env) {
        return Err(Error::NotInitialized);
    };
    Ok(AllocationDataKey::get_allocation(&env, &shareholder, &token).unwrap_or(0))
}
