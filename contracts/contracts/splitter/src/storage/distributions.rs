use soroban_sdk::{contracttype, Address, Env, Vec};

use sorosplits_utils::storage::bump_persistent;

#[derive(Clone)]
#[contracttype]
pub enum WhitelistKeys {
    /// Data key for keeping the list of whitelisted tokens.
    /// Only whitelisted tokens can be used to distribute the allocation.
    WhitelistedTokens,
}

#[derive(Clone, Debug, PartialEq)]
pub struct WhitelistedTokens {}
impl WhitelistedTokens {
    // ========== Whitelisted Tokens ==========

    /// Update the list of whitelisted tokens
    pub fn update(e: &Env, tokens: Vec<Address>) {
        let key = WhitelistKeys::WhitelistedTokens;
        e.storage().persistent().set(&key, &tokens);
        bump_persistent(e, &key);
    }

    /// Checks if the token is whitelisted
    pub fn check_token_address(e: &Env, token: &Address) -> bool {
        let tokens: Vec<Address> = Self::get_list(e);
        tokens.contains(token)
    }

    /// Gets the list of whitelisted tokens
    /// Returns an empty vector if the list doesn't exist
    pub fn get_list(e: &Env) -> Vec<Address> {
        let key = WhitelistKeys::WhitelistedTokens;
        let res = e
            .storage()
            .persistent()
            .get::<WhitelistKeys, Vec<Address>>(&key);
        match res {
            Some(tokens) => {
                bump_persistent(e, &key);
                tokens
            }
            None => Vec::new(&e),
        }
    }
}

#[derive(Clone)]
#[contracttype]
pub enum DistributionKeys {
    /// Key for the the total allocation amount for a token.
    /// token_addr -> allocation_amount
    TotalAllocation(Address),
    /// Key for mapping the allocation amount for a shareholder.
    /// (user_addr, token_addr) -> allocation_amount
    Allocation(Address, Address),
}

#[derive(Clone, Debug, PartialEq)]
pub struct TokenAllocations {}
impl TokenAllocations {
    // ========== User Allocation ==========

    /// Initializes the share for the shareholder
    pub fn save(e: &Env, shareholder: &Address, token: &Address, allocation: i128) {
        match Self::get_total(e, token) {
            Some(total_allocation) => {
                let new_total_allocation = total_allocation + allocation;
                Self::save_total(e, token, new_total_allocation);
            }
            None => {
                Self::save_total(e, token, allocation);
            }
        }

        let key = DistributionKeys::Allocation(shareholder.clone(), token.clone());
        e.storage().persistent().set(&key, &allocation);
        bump_persistent(e, &key);
    }

    pub fn remove(e: &Env, shareholder: &Address, token: &Address) {
        match Self::get_total(e, token) {
            Some(total_allocation) => {
                let allocation = Self::get(e, shareholder, token).unwrap();
                let new_total_allocation = total_allocation - allocation;

                if new_total_allocation == 0 {
                    Self::remove_total(e, token);
                } else {
                    Self::save_total(e, token, new_total_allocation);
                }
            }
            None => (),
        }

        let key = DistributionKeys::Allocation(shareholder.clone(), token.clone());
        e.storage().persistent().remove(&key);
    }

    pub fn get(e: &Env, shareholder: &Address, token: &Address) -> Option<i128> {
        let key = DistributionKeys::Allocation(shareholder.clone(), token.clone());
        let res = e.storage().persistent().get(&key);
        match res {
            Some(allocation) => {
                bump_persistent(e, &key);
                Some(allocation)
            }
            None => None,
        }
    }

    // ========== Total Allocation ==========

    pub fn save_total(e: &Env, token: &Address, total_allocation: i128) {
        let key = DistributionKeys::TotalAllocation(token.clone());
        e.storage().persistent().set(&key, &total_allocation);
        bump_persistent(e, &key);
    }

    pub fn remove_total(e: &Env, token: &Address) {
        let key = DistributionKeys::TotalAllocation(token.clone());
        e.storage().persistent().remove(&key);
    }

    pub fn get_total(e: &Env, token: &Address) -> Option<i128> {
        let key = DistributionKeys::TotalAllocation(token.clone());
        let res = e.storage().persistent().get(&key);
        match res {
            Some(total_allocation) => {
                bump_persistent(e, &key);
                Some(total_allocation)
            }
            None => None,
        }
    }
}
