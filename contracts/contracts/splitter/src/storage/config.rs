use soroban_sdk::{contracttype, Address, Bytes, Env};

use crate::errors::Error;

use sorosplits_utils::storage::bump_instance;

#[derive(Clone)]
#[contracttype]
pub enum ConfigKeys {
    Config,
}

#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub struct ConfigDataKey {
    pub admin: Address,
    pub name: Bytes,
    pub updatable: bool,
}
impl ConfigDataKey {
    /// Initializes the config with the given admin address and updatable flag
    pub fn init(e: &Env, admin: Address, name: Bytes, updatable: bool) {
        bump_instance(e);
        let key = ConfigKeys::Config;
        let config = ConfigDataKey {
            admin,
            name,
            updatable,
        };
        e.storage().instance().set(&key, &config);
    }

    /// Returns the config
    pub fn get(e: &Env) -> Result<ConfigDataKey, Error> {
        if !ConfigDataKey::exists(e) {
            return Err(Error::NotInitialized);
        }
        bump_instance(e);
        let key = ConfigKeys::Config;
        e.storage().instance().get(&key).unwrap()
    }

    /// Locks the contract for further changes
    pub fn lock_contract(mut self, e: &Env) {
        let key = ConfigKeys::Config;
        self.updatable = false;
        e.storage().instance().set(&key, &self);
    }

    pub fn update_name(mut self, e: &Env, name: Bytes) {
        let key = ConfigKeys::Config;
        self.name = name;
        e.storage().instance().set(&key, &self);
    }

    /// Returns true if ConfigDataKey exists in the storage
    pub fn exists(e: &Env) -> bool {
        bump_instance(e);
        let key = ConfigKeys::Config;
        e.storage().instance().has(&key)
    }

    /// Validates the admin address
    pub fn require_admin(self) {
        self.admin.require_auth()
    }

    /// Returns true if the contract is updatable
    pub fn is_contract_locked(self) -> bool {
        self.updatable
    }
}
