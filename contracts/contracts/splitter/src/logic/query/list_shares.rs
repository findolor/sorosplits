use soroban_sdk::{Env, Vec};

use crate::{
    errors::Error,
    storage::{ConfigDataKey, ShareDataKey},
};

pub fn query(env: Env) -> Result<Vec<ShareDataKey>, Error> {
    if !ConfigDataKey::exists(&env) {
        return Err(Error::NotInitialized);
    };

    let mut shares: Vec<ShareDataKey> = Vec::new(&env);

    for shareholder in ShareDataKey::get_shareholders(&env).iter() {
        let share = ShareDataKey::get_share(&env, &shareholder).unwrap();
        shares.push_back(share);
    }

    Ok(shares)
}
