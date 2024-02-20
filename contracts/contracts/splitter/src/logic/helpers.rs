use soroban_sdk::{
    token::{self, TokenClient},
    Address, Env, Vec,
};

use crate::{errors::Error, storage::ShareDataKey};

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
        ShareDataKey::save_share(&env, share.shareholder, share.share);
    }

    // Store the shareholders vector
    ShareDataKey::save_shareholders(&env, shareholders);
}

/// Removes all of the shareholders and their shares
pub fn reset_shares(env: &Env) {
    for shareholder in ShareDataKey::get_shareholders(env).iter() {
        ShareDataKey::remove_share(env, &shareholder);
    }
    ShareDataKey::remove_shareholders(env);
}

pub fn get_token_client<'a>(env: &'a Env, token_address: &Address) -> TokenClient<'a> {
    token::Client::new(env, token_address)
}
