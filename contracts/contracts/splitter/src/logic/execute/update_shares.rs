use soroban_sdk::{Env, Vec};
use sorosplits_utils::types::ShareDataKey;

use crate::{
    errors::Error,
    logic::helpers::{check_shares, reset_shares, update_shares as update_shares_helper},
    storage::config::ConfigDataKey,
};

pub fn execute(env: Env, shares: Vec<ShareDataKey>) -> Result<(), Error> {
    // Make sure the caller is the admin
    ConfigDataKey::get(&env)?.require_admin();

    // Check if the shares sum up to 10000
    check_shares(&shares)?;

    // Remove all of the shareholders and their shares
    reset_shares(&env);

    // Update the shares of the shareholders
    update_shares_helper(&env, &shares)?;

    Ok(())
}
