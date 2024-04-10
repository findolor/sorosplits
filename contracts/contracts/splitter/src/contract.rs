use soroban_sdk::{contract, contractimpl, contractmeta, Address, Bytes, Env, Vec};
use sorosplits_utils::types::ShareDataKey;

use crate::{errors::Error, logic::execute, logic::query, storage::config::ConfigDataKey};

contractmeta!(
    key = "desc",
    val = "Splitter contract is used to distribute tokens to shareholders with predefined shares."
);

pub trait SplitterTrait {
    /// Initializes the contract with the admin and the shareholders
    ///
    /// This method can only be called once.
    /// Runs the `check_shares` function to make sure the shares sum up to 10000.
    ///
    /// ## Arguments
    ///
    /// * `admin` - The admin address for the contract
    /// * `name` - The name of the contract
    /// * `shares` - The shareholders with their shares
    /// * `updatable` - Whether the contract is mutable or not
    fn init_splitter(
        env: Env,
        admin: Address,
        name: Bytes,
        shares: Vec<ShareDataKey>,
        updatable: bool,
    ) -> Result<(), Error>;

    // ========== Execute Functions ==========

    /// **ADMIN ONLY FUNCTION**
    ///
    /// Updates the whitelisted tokens.
    ///
    /// Whitelisted tokens are the tokens that can be distributed to the shareholders.
    /// If the token is not whitelisted, it cannot be distributed.
    ///
    /// ## Arguments
    ///
    /// * `tokens` - The list of token addresses to whitelist
    fn update_whitelisted_tokens(env: Env, tokens: Vec<Address>) -> Result<(), Error>;

    /// **ADMIN ONLY FUNCTION**
    ///
    /// Transfers unused tokens to the recipient.
    ///
    /// Unused tokens are defined as the tokens that are not distributed to the shareholders.
    /// Meaning token balance - sum of all the allocations.
    ///
    /// ## Arguments
    ///
    /// * `token_address` - The address of the token to transfer
    /// * `recipient` - The address of the recipient
    /// * `amount` - The amount of tokens to transfer
    fn transfer_tokens(
        env: Env,
        token_address: Address,
        recipient: Address,
        amount: i128,
    ) -> Result<(), Error>;

    /// **ADMIN ONLY FUNCTION**
    ///
    /// Distributes tokens to the shareholders.
    ///
    /// All of the available token balance is distributed on execution.
    ///
    /// ## Arguments
    ///
    /// * `token_address` - The address of the token to distribute
    /// * `amount` - The amount of tokens to distribute
    fn distribute_tokens(env: Env, token_address: Address, amount: i128) -> Result<(), Error>;

    /// **ADMIN ONLY FUNCTION**
    ///
    /// Updates the shares of the shareholders.
    ///
    /// All of the shares and shareholders are updated on execution.
    ///
    /// ## Arguments
    ///
    /// * `shares` - The updated shareholders with their shares
    fn update_shares(env: Env, shares: Vec<ShareDataKey>) -> Result<(), Error>;

    /// **ADMIN ONLY FUNCTION**
    ///
    /// Updates the name of the contract.
    ///
    /// ## Arguments
    ///
    /// * `name` - The new name for the contract
    fn update_name(env: Env, name: Bytes) -> Result<(), Error>;

    /// **ADMIN ONLY FUNCTION**
    ///
    /// Locks the contract for further shares updates.
    ///
    /// Locking the contract does not affect the distribution of tokens.
    fn lock_contract(env: Env) -> Result<(), Error>;

    /// Withdraws the allocation of the shareholder for the token.
    ///
    /// A shareholder can withdraw their allocation for a token if they have any.
    ///
    /// ## Arguments
    ///
    /// * `token_address` - The address of the token to withdraw
    /// * `shareholder` - The address of the shareholder
    /// * `amount` - The amount of tokens to withdraw
    fn withdraw_allocation(
        env: Env,
        token_address: Address,
        shareholder: Address,
        amount: i128,
    ) -> Result<(), Error>;

    // ========== Query Functions ==========

    /// Gets the share of a shareholder.
    ///
    /// ## Arguments
    ///
    /// * `shareholder` - The address of the shareholder
    ///
    /// ## Returns
    ///
    /// * `Option<i128>` - The share of the shareholder if it exists
    fn get_share(env: Env, shareholder: Address) -> Result<Option<i128>, Error>;

    /// Lists all of the shareholders with their shares.
    ///
    /// ## Returns
    ///
    /// * `Vec<ShareDataKey>` - The list of shareholders with their shares
    fn list_shares(env: Env) -> Result<Vec<ShareDataKey>, Error>;

    /// Gets the contract configuration.
    ///
    /// ## Returns
    ///
    /// * `ConfigDataKey` - The contract configuration
    fn get_config(env: Env) -> Result<ConfigDataKey, Error>;

    /// Gets the allocation of a shareholder for a token.
    ///
    /// ## Arguments
    ///
    /// * `shareholder` - The address of the shareholder
    /// * `token_addres` - The address of the token
    ///
    /// ## Returns
    ///
    /// * `i128` - The allocation of the shareholder for the token
    fn get_allocation(env: Env, shareholder: Address, token_addres: Address)
        -> Result<i128, Error>;

    /// Gets the unused tokens.
    ///
    /// Unused tokens are defined as the tokens that are not distributed to the shareholders.
    ///
    /// ## Returns
    ///
    /// * `i128` - The amount of unused tokens
    fn get_unused_tokens(env: Env, token_addres: Address) -> Result<i128, Error>;

    /// Lists the allocations of the shareholder.
    ///
    /// ## Arguments
    ///
    /// * `shareholder` - The address of the shareholder
    ///
    /// ## Returns
    ///
    /// * `Vec<(Address, i128)>` - The list of allocations for the shareholder
    // fn list_allocations(env: Env, shareholder: Address) -> Result<Vec<(Address, i128)>, Error>;

    /// Lists the whitelisted tokens.
    ///
    /// ## Returns
    ///
    /// * `Vec<Address>` - The list of whitelisted token addresses
    fn list_whitelisted_tokens(env: Env) -> Result<Vec<Address>, Error>;
}

#[contract]
pub struct Splitter;

#[contractimpl]
impl SplitterTrait for Splitter {
    // ========== Execute Functions ==========

    fn init_splitter(
        env: Env,
        admin: Address,
        name: Bytes,
        shares: Vec<ShareDataKey>,
        updatable: bool,
    ) -> Result<(), Error> {
        execute::init(env, admin, name, shares, updatable)
    }

    fn update_whitelisted_tokens(env: Env, tokens: Vec<Address>) -> Result<(), Error> {
        execute::update_whitelisted_tokens(env, tokens)
    }

    fn transfer_tokens(
        env: Env,
        token_address: Address,
        recipient: Address,
        amount: i128,
    ) -> Result<(), Error> {
        execute::transfer_tokens(env, token_address, recipient, amount)
    }

    fn distribute_tokens(env: Env, token_address: Address, amount: i128) -> Result<(), Error> {
        execute::distribute_tokens(env, token_address, amount)
    }

    fn update_shares(env: Env, shares: Vec<ShareDataKey>) -> Result<(), Error> {
        execute::update_shares(env, shares)
    }

    fn update_name(env: Env, name: Bytes) -> Result<(), Error> {
        execute::update_name(env, name)
    }

    fn lock_contract(env: Env) -> Result<(), Error> {
        execute::lock_contract(env)
    }

    fn withdraw_allocation(
        env: Env,
        token_address: Address,
        shareholder: Address,
        amount: i128,
    ) -> Result<(), Error> {
        execute::withdraw_allocation(env, token_address, shareholder, amount)
    }

    // ========== Query Functions ==========

    fn get_share(env: Env, shareholder: Address) -> Result<Option<i128>, Error> {
        query::get_share(env, shareholder)
    }

    fn list_shares(env: Env) -> Result<Vec<ShareDataKey>, Error> {
        query::list_shares(env)
    }

    fn get_config(env: Env) -> Result<ConfigDataKey, Error> {
        query::get_config(env)
    }

    fn get_allocation(
        env: Env,
        shareholder: Address,
        token_addres: Address,
    ) -> Result<i128, Error> {
        query::get_allocation(env, shareholder, token_addres)
    }

    fn get_unused_tokens(env: Env, token_addres: Address) -> Result<i128, Error> {
        query::get_unused_tokens(env, token_addres)
    }

    // fn list_allocations(env: Env, shareholder: Address) -> Result<Vec<(Address, i128)>, Error> {
    //     query::list_allocations(env, shareholder)
    // }

    fn list_whitelisted_tokens(env: Env) -> Result<Vec<Address>, Error> {
        query::list_whitelisted_tokens(env)
    }
}
