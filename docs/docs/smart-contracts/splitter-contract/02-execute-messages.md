---
sidebar_position: 2
---

# Execute Messages

Execute messages are the means by which users interact with the Splitter Contract. They are essentially function calls that trigger the contract's methods, allowing for operations such as initializing the contract, distributing tokens, updating shares, and more.

## Design Choices

- **Fixed Share Total**: The total shares are fixed at 10,000 units to ensure a clear and consistent division of tokens among shareholders.
- **Immutable State Post-Initialization**: The contract can be initialized only once, after which the configuration becomes immutable if the mutable flag is set to false.
- **Admin Control**: Certain functions, such as updating shares or locking the contract, can only be executed by the admin, ensuring centralized control over critical operations.
- **Open Distribution**: The `distribute_tokens` function can be called by anyone, allowing for flexible token distribution events.

## Execute Message Functions

### `init_splitter`

Initializes the contract with the necessary parameters. This method can only be called once.

**Parameters:**

- **`env`**: The environment.
- **`admin`**: The address of the admin.
- **`name`**: The name of the contract.
- **`shares`**: A vector of `ShareDataKey` structs representing the shareholders and their respective shares.
- **`updatable`**: A boolean flag indicating whether the contract is mutable.

**Returns:**

- `Result<(), Error>`: Returns an empty result on success or an error on failure.

### `update_whitelisted_tokens`

**ADMIN ONLY FUNCTION**

Updates the whitelisted tokens. Only whitelisted tokens can be distributed to the shareholders.

**Parameters:**

- **`env`**: The environment.
- **`tokens`**: A list of token addresses to whitelist.

**Returns:**

- `Result<(), Error>`: Returns an empty result on success or an error on failure.

### `transfer_tokens`

**ADMIN ONLY FUNCTION**

Transfers unused tokens to the recipient. Unused tokens are defined as the tokens that are not distributed to the shareholders (i.e., token balance - sum of all the allocations).

**Parameters:**

- **`env`**: The environment.
- **`token_address`**: The address of the token to transfer.
- **`recipient`**: The address of the recipient.
- **`amount`**: The amount of tokens to transfer.

**Returns:**

- `Result<(), Error>`: Returns an empty result on success or an error on failure.

### `distribute_tokens`

Distributes tokens to the shareholders. All of the available balance of the specified token is distributed on execution.

**Parameters:**

- **`env`**: The environment.
- **`token_address`**: The address of the token to distribute.
- **`amount`**: The amount of tokens to distribute.

**Returns:**

- `Result<(), Error>`: Returns an empty result on success or an error on failure.

### `update_shares`

**ADMIN ONLY FUNCTION**

Updates the shares of the shareholders. All of the shares and shareholders are updated on execution.

**Parameters:**

- **`env`**: The environment.
- **`shares`**: A vector of `ShareDataKey` structs representing the updated shareholders and their respective shares.

**Returns:**

- `Result<(), Error>`: Returns an empty result on success or an error on failure.

### `update_name`

**ADMIN ONLY FUNCTION**

Updates the name of the contract.

**Parameters:**

- **`env`**: The environment.
- **`name`**: The new name for the contract.

**Returns:**

- `Result<(), Error>`: Returns an empty result on success or an error on failure.

### `lock_contract`

**ADMIN ONLY FUNCTION**

Locks the contract to prevent further updates to the shares. Locking the contract does not affect the distribution of tokens.

**Parameters:** None

**Returns:**

- `Result<(), Error>`: Returns an empty result on success or an error on failure.

### `withdraw_allocation`

Withdraws the allocation of the shareholder for the token. A shareholder can withdraw their allocation for a token if they have any.

**Parameters:**

- **`env`**: The environment.
- **`token_address`**: The address of the token to withdraw.
- **`shareholder`**: The address of the shareholder.
- **`amount`**: The amount of tokens to withdraw.

**Returns:**

- `Result<(), Error>`: Returns an empty result on success or an error on failure.

### `withdraw_external_allocation`

Withdraws the allocation of the current contract from another splitter contract.

**Parameters:**

- **`env`**: The environment.
- **`splitter_address`**: The address of the splitter contract.
- **`token_address`**: The address of the token to withdraw.
- **`amount`**: The amount of tokens to withdraw.

**Returns:**

- `Result<(), Error>`: Returns an empty result on success or an error on failure.
