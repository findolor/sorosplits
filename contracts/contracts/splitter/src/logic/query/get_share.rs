use soroban_sdk::{Address, Env};

use crate::{
    errors::Error,
    storage::{ConfigDataKey, ShareDataKey},
};

pub fn query(env: Env, shareholder: Address) -> Result<Option<i128>, Error> {
    if !ConfigDataKey::exists(&env) {
        return Err(Error::NotInitialized);
    };
    match ShareDataKey::get_share(&env, &shareholder) {
        Some(share) => Ok(Some(share.share)),
        None => Ok(None),
    }
}
