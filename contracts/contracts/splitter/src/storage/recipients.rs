use soroban_sdk::{contracttype, Address, Env, Vec};

use sorosplits_utils::{storage::bump_persistent, types::ShareDataKey};

#[derive(Clone)]
#[contracttype]
pub enum RecipientKeys {
    /// Data key for keeping all of the shareholders in the contract
    Shareholders,
    /// Data key for keeping the share of a shareholder.
    /// shareholder_addr -> ShareDataKey
    Share(Address),
}
impl RecipientKeys {
    /// Initializes the share for the shareholder
    pub fn save_share(e: &Env, shareholder: Address, share: i128) {
        let key = RecipientKeys::Share(shareholder.clone());
        e.storage()
            .persistent()
            .set(&key, &ShareDataKey { shareholder, share });
        bump_persistent(e, &key);
    }

    /// Returns the share for the shareholder
    pub fn get_share(e: &Env, shareholder: &Address) -> Option<ShareDataKey> {
        let key = RecipientKeys::Share(shareholder.clone());
        let res = e
            .storage()
            .persistent()
            .get::<RecipientKeys, ShareDataKey>(&key);
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
        let key = RecipientKeys::Share(shareholder.clone());
        e.storage().persistent().remove(&key);
    }

    /// Saves the list of shareholders
    pub fn save_shareholders(e: &Env, shareholders: Vec<Address>) {
        let key = RecipientKeys::Shareholders;
        e.storage().persistent().set(&key, &shareholders);
        bump_persistent(e, &key);
    }

    /// Returns the list of shareholders
    pub fn get_shareholders(e: &Env) -> Vec<Address> {
        let key = RecipientKeys::Shareholders;
        let res = e
            .storage()
            .persistent()
            .get::<RecipientKeys, Vec<Address>>(&key);
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
        let key = RecipientKeys::Shareholders;
        e.storage().persistent().remove(&key);
    }
}
