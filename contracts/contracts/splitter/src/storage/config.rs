use soroban_sdk::{contracttype, Address, Bytes, Env};

use crate::errors::Error;

use super::bump_instance;

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
    pub fn get(e: &Env) -> Option<ConfigDataKey> {
        bump_instance(e);
        let key = ConfigKeys::Config;
        e.storage().instance().get(&key)
    }

    /// Locks the contract for further changes
    pub fn lock_contract(e: &Env) {
        bump_instance(e);
        let key = ConfigKeys::Config;
        let config: Option<ConfigDataKey> = e.storage().instance().get(&key);
        match config {
            Some(mut config) => {
                config.updatable = false;
                e.storage().instance().set(&key, &config);
            }
            None => (),
        }
    }

    /// Returns true if ConfigDataKey exists in the storage
    pub fn exists(e: &Env) -> bool {
        bump_instance(e);
        let key = ConfigKeys::Config;
        e.storage().instance().has(&key)
    }

    /// Validates the admin address
    pub fn require_admin(e: &Env) -> Result<(), Error> {
        bump_instance(e);
        let key = ConfigKeys::Config;
        let config: ConfigDataKey = e.storage().instance().get(&key).unwrap();
        config.admin.require_auth();
        Ok(())
    }

    /// Returns true if the contract is updatable
    // TODO: Maybe return an error if ConfigDataKey doesn't exist
    pub fn is_contract_locked(e: &Env) -> bool {
        bump_instance(e);
        let key = ConfigKeys::Config;
        let config: Option<ConfigDataKey> = e.storage().instance().get(&key);
        match config {
            Some(config) => config.updatable,
            None => false,
        }
    }
}
