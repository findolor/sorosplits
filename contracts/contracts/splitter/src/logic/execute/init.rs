use soroban_sdk::{Address, Bytes, Env, Vec};
use sorosplits_utils::types::ShareDataKey;

use crate::{
    errors::Error,
    logic::helpers::{check_shares, update_shares},
    storage::config::ConfigDataKey,
};

pub fn execute(
    env: Env,
    admin: Address,
    name: Bytes,
    shares: Vec<ShareDataKey>,
    updatable: bool,
) -> Result<(), Error> {
    if ConfigDataKey::exists(&env) {
        return Err(Error::AlreadyInitialized);
    };

    // Initialize the contract configuration
    ConfigDataKey::init(&env, admin, name, updatable);

    // Check if the shares sum up to 10000
    check_shares(&shares)?;

    // Update the shares of the shareholders
    update_shares(&env, &shares);

    Ok(())
}
