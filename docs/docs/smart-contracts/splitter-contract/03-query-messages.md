---
sidebar_position: 3
---

# Query Messages

Query messages allow users to retrieve information from the Splitter Contract. These functions do not modify the state of the contract and are used to get details about shares, allocations, and contract configuration.

## Query Message Functions

### `get_share`

Gets the share of a specific shareholder.

**Parameters:**

- **`env`**: The environment.
- **`shareholder`**: The address of the shareholder.

**Returns:**

- `Result<Option<i128>, Error>`: Returns the share of the shareholder if it exists, or `None` if the shareholder is not found.

### `list_shares`

Lists all of the shareholders with their shares.

**Parameters:**

- **`env`**: The environment.

**Returns:**

- `Result<Vec<ShareDataKey>, Error>`: Returns a vector of `ShareDataKey` structs representing all shareholders and their respective shares.

### `get_config`

Gets the contract configuration.

**Parameters:**

- **`env`**: The environment.

**Returns:**

- `Result<ConfigDataKey, Error>`: Returns the contract configuration, including admin address and mutability state.

### `get_allocation`

Gets the allocation of a specific shareholder for a specific token.

**Parameters:**

- **`env`**: The environment.
- **`shareholder`**: The address of the shareholder.
- **`token_address`**: The address of the token.

**Returns:**

- `Result<i128, Error>`: Returns the allocation of the shareholder for the specified token.

### `get_unused_tokens`

Gets the amount of unused tokens for a specific token.

**Parameters:**

- **`env`**: The environment.
- **`token_address`**: The address of the token.

**Returns:**

- `Result<i128, Error>`: Returns the amount of unused tokens for the specified token.

### `list_whitelisted_tokens`

Lists all the whitelisted tokens.

**Parameters:**

- **`env`**: The environment.

**Returns:**

- `Result<Vec<Address>, Error>`: Returns a vector of addresses representing all whitelisted tokens.
