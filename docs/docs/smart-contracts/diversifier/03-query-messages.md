---
sidebar_position: 3
---

# Query Messages

Query messages allow users to retrieve information from the Diversifier Contract. These functions do not modify the state of the contract and are used to get details about the contract configuration and whitelisted swap tokens.

## Query Message Functions

### `get_diversifier_config`

Gets the contract configuration.

**Parameters:**

- **`env`**: The environment.

**Returns:**

- `Result<DiversifierConfig, ContractError>`: Returns the contract configuration.

### `list_whitelisted_swap_tokens`

Lists the whitelisted swap tokens for a token.

**Parameters:**

- **`env`**: The environment.
- **`token_address`**: The address of the token to list the whitelisted swap tokens for.

**Returns:**

- `Result<Vec<Address>, ContractError>`: Returns a vector of addresses representing the whitelisted swap tokens for the specified token.
