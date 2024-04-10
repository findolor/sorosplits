use soroban_sdk::{Address, Env, Vec};
use sorosplits_utils::types::ShareDataKey;

use crate::{errors::Error, storage::recipients::RecipientKeys};

/// Checks if the shares sum up to 10000
pub fn check_shares(shares: &Vec<ShareDataKey>) -> Result<(), Error> {
    if shares.len() < 2 {
        return Err(Error::LowShareCount);
    };

    let total = shares.iter().fold(0, |acc, share| acc + share.share);

    if total != 10000 {
        return Err(Error::InvalidShareTotal);
    };

    Ok(())
}

/// Updates the shares of the shareholders
pub fn update_shares(env: &Env, shares: &Vec<ShareDataKey>) {
    // Shareholders are stored in a vector
    let mut shareholders: Vec<Address> = Vec::new(&env);

    for share in shares.iter() {
        // Add the shareholder to the vector
        shareholders.push_back(share.shareholder.clone());

        // Store the share for each shareholder
        RecipientKeys::save_share(&env, share.shareholder, share.share);
    }

    // Store the shareholders vector
    RecipientKeys::save_shareholders(&env, shareholders);
}

/// Removes all of the shareholders and their shares
pub fn reset_shares(env: &Env) {
    for shareholder in RecipientKeys::get_shareholders(env).iter() {
        RecipientKeys::remove_share(env, &shareholder);
    }
    RecipientKeys::remove_shareholders(env);
}
