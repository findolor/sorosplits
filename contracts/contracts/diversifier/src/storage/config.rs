use soroban_sdk::{contracttype, Address, Env};

use crate::errors::Error;

use super::DiversifierDataKeys;

#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub struct DiversifierConfig {
    pub admin: Address,
    pub splitter_address: Address,
}
impl DiversifierConfig {
    pub fn init(e: &Env, admin: Address, splitter_address: Address) {
        let key = DiversifierDataKeys::Config;
        let config = DiversifierConfig {
            admin,
            splitter_address,
        };
        e.storage().instance().set(&key, &config);
    }

    pub fn get(e: &Env) -> Result<DiversifierConfig, Error> {
        if !DiversifierConfig::exists(e) {
            return Err(Error::NotInitialized);
        }
        let key = DiversifierDataKeys::Config;
        e.storage().instance().get(&key).unwrap()
    }

    pub fn exists(e: &Env) -> bool {
        let key = DiversifierDataKeys::Config;
        e.storage().instance().has(&key)
    }

    /// Validates the admin address
    pub fn require_admin(&self) -> Result<(), Error> {
        self.admin.require_auth();
        Ok(())
    }
}
