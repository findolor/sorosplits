use soroban_sdk::{Address, Env, Vec};

use crate::{
    errors::Error,
    logic::helpers::{check_shares, update_shares},
    storage::{ConfigDataKey, ShareDataKey},
};

pub fn execute(
    env: Env,
    admin: Address,
    shares: Vec<ShareDataKey>,
    mutable: bool,
) -> Result<(), Error> {
    if ConfigDataKey::exists(&env) {
        return Err(Error::AlreadyInitialized);
    };

    // Initialize the contract configuration
    ConfigDataKey::init(&env, admin, mutable);

    // Check if the shares sum up to 10000
    check_shares(&shares)?;

    // Update the shares of the shareholders
    update_shares(&env, &shares);

    Ok(())
}
