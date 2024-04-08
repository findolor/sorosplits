pub mod config;
pub mod swaps;

use soroban_sdk::{contracttype, Address};

#[derive(Clone)]
#[contracttype]
pub enum DiversifierDataKeys {
    Config,
    SwapTokens(Address),
}
