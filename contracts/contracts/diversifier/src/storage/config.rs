use soroban_sdk::{contracttype, Address, Env};

use crate::errors::Error;

use super::DiversifierDataKeys;

#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub struct DiversifierConfig {
    pub admin: Address,
    pub splitter_address: Address,
    pub diversifier_active: bool,
}
impl DiversifierConfig {
    pub fn init(e: &Env, admin: Address, splitter_address: Address, diversifier_active: bool) {
        let key = DiversifierDataKeys::Config;
        let config = DiversifierConfig {
            admin,
            splitter_address,
            diversifier_active,
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

    pub fn toggle_diversifier_active(e: &Env) -> Result<(), Error> {
        let mut config = DiversifierConfig::get(e)?;
        config.diversifier_active = !config.diversifier_active;
        e.storage()
            .instance()
            .set(&DiversifierDataKeys::Config, &config);
        Ok(())
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

    /// Validates the contract is active
    pub fn require_diversifier_active(&self) -> Result<(), Error> {
        if !self.diversifier_active {
            return Err(Error::NotActive);
        }
        Ok(())
    }

    /// Validates the contract is inactive
    pub fn require_diversifier_inactive(&self) -> Result<(), Error> {
        if self.diversifier_active {
            return Err(Error::NotAllowed);
        }
        Ok(())
    }
}
