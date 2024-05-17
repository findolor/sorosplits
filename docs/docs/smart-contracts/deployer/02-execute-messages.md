---
sidebar_position: 2
---

# Execute Messages

Execute messages are the means by which users interact with the Deployer Contract. They are essentially function calls that trigger the contract's methods, allowing for operations such as deploying and initializing contracts.

## Execute Message Functions

### `deploy_splitter`

Deploys the Splitter contract and initializes it with the given arguments.

**Parameters:**

- **`env`**: The environment.
- **`deployer`**: The address of the deployer.
- **`wasm_hash`**: The hash of the Wasm code of the Splitter contract.
- **`salt`**: The salt to use for the deployment of the Splitter contract.
- **`init_args`**: The arguments to pass to the init function of the Splitter contract.

**Returns:**

- `(Address, Val)`: Returns the contract address of the deployed contract and the result of invoking the init function.

### `deploy_diversifier`

Deploys the Diversifier contract and initializes it with the given arguments.

**Parameters:**

- **`env`**: The environment.
- **`deployer`**: The address of the deployer.
- **`wasm_hash`**: The hash of the Wasm code of the Diversifier contract.
- **`salt`**: The salt to use for the deployment of the Diversifier contract.
- **`init_args`**: The arguments to pass to the init function of the Diversifier contract.

**Returns:**

- `(Address, Val)`: Returns the contract address of the deployed contract and the result of invoking the init function.

### `deploy_network`

Deploys a network of Diversifier contracts and initializes them with the given arguments.

**Parameters:**

- **`env`**: The environment.
- **`deployer`**: The address of the deployer.
- **`wasm_hashes`**: A map of contract types to their respective Wasm hashes.
- **`args`**: A vector of `NetworkArg` structs containing the initialization arguments for each contract.

**Returns:**

- `Map<u32, Address>`: Returns a map of contract IDs to their respective deployed addresses.

**NetworkArg Struct:**

- **`id`**: The ID of the contract.
- **`is_diversifier_active`**: A boolean indicating whether the diversifier should be active after initialization.
- **`salt`**: The salt to use for the deployment of the contract.
- **`splitter_data`**: A `SplitterData` struct containing the initialization data for the Splitter contract.
- **`output_contracts`**: A vector of `OutputContractData` structs containing the output contract data.

**SplitterData Struct:**

- **`name`**: The name of the Splitter contract.
- **`shares`**: A vector of share data.
- **`updatable`**: A boolean indicating whether the contract is updatable.

**OutputContractData Struct:**

- **`id`**: The ID of the output contract.
- **`share`**: The share amount allocated to the output contract.
