use soroban_sdk::{Address, Env, Vec};

use sorosplits_utils::token::check_token;

use crate::{
    errors::Error,
    storage::{config::ConfigDataKey, distributions::WhitelistedTokens},
};

pub fn execute(env: Env, tokens: Vec<Address>) -> Result<(), Error> {
    // Make sure the caller is the admin
    ConfigDataKey::get(&env)?.require_admin();

    // Check if token address is valid
    for token_address in tokens.iter() {
        check_token(&env, &token_address);
    }

    // Update the whitelisted tokens list
    WhitelistedTokens::update(&env, tokens);

    Ok(())
}
