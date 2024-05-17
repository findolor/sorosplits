---
sidebar_position: 2
---

# Execute Messages

Execute messages are the means by which users interact with the Diversifier Contract. They are essentially function calls that trigger the contract's methods, allowing for operations such as initializing the contract, updating swap tokens, swapping and distributing tokens, and more.

## Execute Message Functions

### `init_diversifier`

Initializes the diversifier contract. This method can only be called once and deploys the splitter contract with the given arguments.

**Parameters:**

- **`env`**: The environment.
- **`admin`**: The admin address for the contract.
- **`wasm_hash`**: The hash of the Wasm code of the splitter contract.
- **`salt`**: The salt to use for the deployment of the splitter contract.
- **`is_active`**: Whether the diversifier should be active after initialization.
- **`splitter_init_args`**: The arguments to pass to the init function of the splitter contract.

**Returns:**

- `Result<(), ContractError>`: Returns an empty result on success or an error on failure.

### `update_whitelisted_swap_tokens`

Updates the whitelisted swap tokens for a token.

**Parameters:**

- **`env`**: The environment.
- **`token_address`**: The address of the token to update the swap tokens for.
- **`swap_tokens`**: The list of swap tokens to whitelist.

**Returns:**

- `Result<(), ContractError>`: Returns an empty result on success or an error on failure.

### `swap_and_distribute_tokens`

Swaps tokens and distributes them to the shareholders.

**Parameters:**

- **`env`**: The environment.
- **`swap_path`**: The swap path to use for the swap. The first element is the token to swap, the last element is the token to receive.
- **`amount`**: The amount of tokens to swap.

**Returns:**

- `Result<(), ContractError>`: Returns an empty result on success or an error on failure.

### `toggle_diversifier`

Toggles the diversifier active state.

**Parameters:**

- **`env`**: The environment.

**Returns:**

- `Result<(), ContractError>`: Returns an empty result on success or an error on failure.
