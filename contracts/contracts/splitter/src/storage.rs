use soroban_sdk::{contracttype, Address, Env, IntoVal, Val, Vec};

use crate::errors::Error;

const DAY_IN_LEDGERS: u32 = 17280;

const INSTANCE_BUMP_AMOUNT: u32 = 7 * DAY_IN_LEDGERS;
const INSTANCE_LIFETIME_THRESHOLD: u32 = INSTANCE_BUMP_AMOUNT - DAY_IN_LEDGERS;

const PERSISTENT_BUMP_AMOUNT: u32 = 30 * DAY_IN_LEDGERS;
const PERSISTENT_LIFETIME_THRESHOLD: u32 = PERSISTENT_BUMP_AMOUNT - DAY_IN_LEDGERS;

fn bump_instance(e: &Env) {
    e.storage()
        .instance()
        .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
}

fn bump_persistent<K>(e: &Env, key: &K)
where
    K: IntoVal<Env, Val>,
{
    e.storage()
        .persistent()
        .extend_ttl(key, PERSISTENT_LIFETIME_THRESHOLD, PERSISTENT_BUMP_AMOUNT);
}

#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub struct ShareDataKey {
    pub shareholder: Address,
    pub share: i128,
}
impl ShareDataKey {
    /// Initializes the share for the shareholder
    pub fn save_share(e: &Env, shareholder: Address, share: i128) {
        let key = DataKey::Share(shareholder.clone());
        e.storage()
            .persistent()
            .set(&key, &ShareDataKey { shareholder, share });
        bump_persistent(e, &key);
    }

    /// Returns the share for the shareholder
    pub fn get_share(e: &Env, shareholder: &Address) -> Option<ShareDataKey> {
        let key = DataKey::Share(shareholder.clone());
        let res = e.storage().persistent().get::<DataKey, ShareDataKey>(&key);
        match res {
            Some(share) => {
                bump_persistent(e, &key);
                Some(share)
            }
            None => None,
        }
    }

    /// Removes the share for the shareholder
    pub fn remove_share(e: &Env, shareholder: &Address) {
        let key = DataKey::Share(shareholder.clone());
        e.storage().persistent().remove(&key);
    }

    /// Saves the list of shareholders
    pub fn save_shareholders(e: &Env, shareholders: Vec<Address>) {
        let key = DataKey::Shareholders;
        e.storage().persistent().set(&key, &shareholders);
        bump_persistent(e, &key);
    }

    /// Returns the list of shareholders
    pub fn get_shareholders(e: &Env) -> Vec<Address> {
        let key = DataKey::Shareholders;
        let res = e.storage().persistent().get::<DataKey, Vec<Address>>(&key);
        match res {
            Some(shareholders) => {
                bump_persistent(e, &key);
                shareholders
            }
            None => Vec::new(&e),
        }
    }

    /// Removes the list of shareholders
    pub fn remove_shareholders(e: &Env) {
        let key = DataKey::Shareholders;
        e.storage().persistent().remove(&key);
    }
}

#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub struct ConfigDataKey {
    pub admin: Address,
    pub mutable: bool,
}
impl ConfigDataKey {
    /// Initializes the config with the given admin address and mutable flag
    pub fn init(e: &Env, admin: Address, mutable: bool) {
        bump_instance(e);
        let key = DataKey::Config;
        let config = ConfigDataKey { admin, mutable };
        e.storage().instance().set(&key, &config);
    }

    /// Returns the config
    pub fn get(e: &Env) -> Option<ConfigDataKey> {
        bump_instance(e);
        let key = DataKey::Config;
        e.storage().instance().get(&key)
    }

    /// Locks the contract for further changes
    pub fn lock_contract(e: &Env) {
        bump_instance(e);
        let key = DataKey::Config;
        let config: Option<ConfigDataKey> = e.storage().instance().get(&key);
        match config {
            Some(mut config) => {
                config.mutable = false;
                e.storage().instance().set(&key, &config);
            }
            None => (),
        }
    }

    /// Returns true if ConfigDataKey exists in the storage
    pub fn exists(e: &Env) -> bool {
        bump_instance(e);
        let key = DataKey::Config;
        e.storage().instance().has(&key)
    }

    /// Validates the admin address
    pub fn require_admin(e: &Env) -> Result<(), Error> {
        bump_instance(e);
        let key = DataKey::Config;
        let config: ConfigDataKey = e.storage().instance().get(&key).unwrap();
        config.admin.require_auth();
        Ok(())
    }

    /// Returns true if the contract is mutable
    // TODO: Maybe return an error if ConfigDataKey doesn't exist
    pub fn is_contract_locked(e: &Env) -> bool {
        bump_instance(e);
        let key = DataKey::Config;
        let config: Option<ConfigDataKey> = e.storage().instance().get(&key);
        match config {
            Some(config) => config.mutable,
            None => false,
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct AllocationDataKey {}
impl AllocationDataKey {
    // ========== User Allocation ==========

    /// Initializes the share for the shareholder
    pub fn save_allocation(e: &Env, shareholder: &Address, token: &Address, allocation: i128) {
        match Self::get_total_allocation(e, token) {
            Some(total_allocation) => {
                let new_total_allocation = total_allocation + allocation;
                Self::save_total_allocation(e, token, new_total_allocation);
            }
            None => {
                Self::save_total_allocation(e, token, allocation);
            }
        }

        let key = DataKey::Allocation(shareholder.clone(), token.clone());
        e.storage().persistent().set(&key, &allocation);
        bump_persistent(e, &key);
    }

    pub fn remove_allocation(e: &Env, shareholder: &Address, token: &Address) {
        match Self::get_total_allocation(e, token) {
            Some(total_allocation) => {
                let allocation = Self::get_allocation(e, shareholder, token).unwrap();
                let new_total_allocation = total_allocation - allocation;

                if new_total_allocation == 0 {
                    Self::remove_total_allocation(e, token);
                } else {
                    Self::save_total_allocation(e, token, new_total_allocation);
                }
            }
            None => (),
        }

        let key = DataKey::Allocation(shareholder.clone(), token.clone());
        e.storage().persistent().remove(&key);
    }

    pub fn get_allocation(e: &Env, shareholder: &Address, token: &Address) -> Option<i128> {
        let key = DataKey::Allocation(shareholder.clone(), token.clone());
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

    pub fn save_total_allocation(e: &Env, token: &Address, total_allocation: i128) {
        let key = DataKey::TotalAllocation(token.clone());
        e.storage().persistent().set(&key, &total_allocation);
        bump_persistent(e, &key);
    }

    pub fn remove_total_allocation(e: &Env, token: &Address) {
        let key = DataKey::TotalAllocation(token.clone());
        e.storage().persistent().remove(&key);
    }

    pub fn get_total_allocation(e: &Env, token: &Address) -> Option<i128> {
        let key = DataKey::TotalAllocation(token.clone());
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

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Config,
    // Storage keys for the shareholder and share data
    //
    /// Data key for keeping all of the shareholders in the contract
    Shareholders,
    /// Data key for keeping the share of a shareholder.
    /// User addresses are mapped to their shares
    Share(Address),
    // Storage keys for the allocations
    //
    /// Data key for keeping the total allocation amount for a token.
    /// Token addresses are mapped to their total allocation amount.
    TotalAllocation(Address),
    /// Data key for keeping the allocation amount for a shareholder.
    /// User addresses with token addresses are mapped to their allocation amount.
    ///
    /// (UserAddr, TokenAddr) -> Allocation
    Allocation(Address, Address),
}
