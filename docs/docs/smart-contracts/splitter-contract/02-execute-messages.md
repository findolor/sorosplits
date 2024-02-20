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

### `init`

Initializes the contract with the necessary parameters.

**Parameters:**

- **`admin`**: The address of the admin.
- **`shares`**: A vector of `ShareDataKey` structs representing the shareholders and their respective shares.
- **`mutable`**: A boolean flag indicating whether the contract is mutable.

### `distribute_tokens`

Distributes the available tokens to shareholders based on their shares.

**Parameters:**

- **`token_address`**: The address of the token to be distributed.

### `update_shares`

Updates the shares of the shareholders.

**Parameters:**

- **`shares`**: A vector of `ShareDataKey` structs representing the updated shareholders and their respective shares.

### `lock_contract`

Locks the contract to prevent further updates to the shares.

**Parameters:** None
