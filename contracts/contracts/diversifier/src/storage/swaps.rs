use soroban_sdk::{Address, Env, Vec};

use sorosplits_utils::storage::bump_persistent;

use super::DiversifierDataKeys;

#[derive(Clone, Debug, PartialEq)]
pub struct DiversifierWhitelistedSwapTokens {}
impl DiversifierWhitelistedSwapTokens {
    pub fn set(e: &Env, token_address: Address, swap_tokens: Vec<Address>) {
        let key = DiversifierDataKeys::SwapTokens(token_address.clone());
        e.storage().persistent().set(&key, &swap_tokens);
    }

    pub fn get(e: &Env, token_address: &Address) -> Vec<Address> {
        let key = DiversifierDataKeys::SwapTokens(token_address.clone());
        let res: Option<Vec<Address>> = e.storage().persistent().get(&key);
        match res {
            Some(tokens) => {
                bump_persistent(e, &key);
                tokens
            }
            None => Vec::new(&e),
        }
    }

    pub fn is_swap_token_valid(
        e: &Env,
        token_address: &Address,
        swap_token_address: &Address,
    ) -> bool {
        let swap_tokens = Self::get(e, token_address);
        swap_tokens.contains(swap_token_address)
    }
}
