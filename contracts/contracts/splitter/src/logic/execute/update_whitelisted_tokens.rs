use soroban_sdk::{Address, Env, Vec};

use crate::{
    errors::Error,
    logic::helpers::check_token,
    storage::{config::ConfigDataKey, distributions::WhitelistedTokens},
};

pub fn execute(env: Env, tokens: Vec<Address>) -> Result<(), Error> {
    if !ConfigDataKey::exists(&env) {
        return Err(Error::NotInitialized);
    };

    // Make sure the caller is the admin
    ConfigDataKey::require_admin(&env)?;

    // Check if token address is valid
    for token_address in tokens.iter() {
        check_token(&env, &token_address)?;
    }

    // Update the whitelisted tokens list
    WhitelistedTokens::update(&env, tokens);

    Ok(())
}
