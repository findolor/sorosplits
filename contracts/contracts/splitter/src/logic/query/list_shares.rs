use soroban_sdk::{Env, Vec};
use sorosplits_utils::types::ShareDataKey;

use crate::{
    errors::Error,
    storage::{config::ConfigDataKey, recipients::RecipientKeys},
};

pub fn query(env: Env) -> Result<Vec<ShareDataKey>, Error> {
    if !ConfigDataKey::exists(&env) {
        return Err(Error::NotInitialized);
    };

    let mut shares: Vec<ShareDataKey> = Vec::new(&env);

    for shareholder in RecipientKeys::get_shareholders(&env).iter() {
        let share = RecipientKeys::get_share(&env, &shareholder).unwrap();
        shares.push_back(share);
    }

    Ok(shares)
}
