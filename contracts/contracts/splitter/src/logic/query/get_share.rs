use soroban_sdk::{Address, Env};

use crate::{
    errors::Error,
    storage::{config::ConfigDataKey, recipients::RecipientKeys},
};

pub fn query(env: Env, shareholder: Address) -> Result<Option<i128>, Error> {
    if !ConfigDataKey::exists(&env) {
        return Err(Error::NotInitialized);
    };
    match RecipientKeys::get_share(&env, &shareholder) {
        Some(share) => Ok(Some(share.share)),
        None => Ok(None),
    }
}
