---
sidebar_position: 4
---

# Data Structures & Errors

This section provides detailed information about the data structures and errors used in the Diversifier Contract. Understanding these structures and errors is crucial for effectively interacting with the contract.

## Data Structures

### DiversifierConfig

Represents the configuration of the diversifier contract. This structure holds essential information about the contract's administrative settings and its active state.

**Fields:**

- **`admin`**: The admin address of the contract. This address has special permissions to perform administrative tasks.
- **`splitter_address`**: The address of the deployed splitter contract.
- **`diversifier_active`**: A boolean indicating whether the diversifier is active.

**Key Structs and Storage Variants:**

- **`DiversifierDataKeys`**: Enum used to define storage keys.
  - **`Config`**: Key used to store the configuration data.

### DiversifierWhitelistedSwapTokens

Manages the list of whitelisted swap tokens for each token. This ensures that only approved tokens can be used for swapping.

**Fields:**

- **`SwapTokens(Address)`**: A key that maps a token address to a list of whitelisted swap token addresses.

**Key Structs and Storage Variants:**

- **`DiversifierDataKeys`**: Enum used to define storage keys.
  - **`SwapTokens(Address)`**: Key used to store the list of whitelisted swap tokens for a specific token.

## Errors

The Diversifier contract defines a set of errors to handle various failure conditions. Each error is represented by an enum variant with a unique code.

### ContractError Enum

**Variants:**

- **`NotInitialized` (201)**: The contract has not been initialized.
- **`NotActive` (202)**: The diversifier is not active.
- **`NotAllowed` (203)**: The operation is not allowed.
- **`InvalidSwapPath` (204)**: The swap path provided is invalid.
- **`InvalidSwapToken` (205)**: The swap token provided is not whitelisted.
- **`InsufficientTokenBalance` (206)**: Insufficient token balance for the operation.
