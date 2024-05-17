---
sidebar_position: 4
---

# Data Structures & Errors

This section provides detailed information about the data structures and errors used in the Splitter Contract. Understanding these structures and errors is crucial for effectively interacting with the contract.

## Data Structures

### Contract Config

Represents the configuration of the contract. This structure holds essential information about the contract's administrative settings and its mutability state.

**Fields:**

- **`admin`**: The admin address of the contract. This address has special permissions to perform administrative tasks such as updating shares and locking the contract.
- **`name`**: The name of the contract. This is a human-readable identifier for the contract.
- **`updatable`**: A boolean indicating whether the contract is mutable. If set to `false`, certain administrative actions, such as updating shares, are restricted.

**Key Structs and Storage Variants:**

- **`ConfigKeys`**: Enum used to define storage keys.
  - **`Config`**: Key used to store the configuration data.

### Whitelisted Tokens

Manages the list of whitelisted tokens. Only tokens that are whitelisted can be distributed to shareholders. This ensures that only approved tokens are used within the contract.

**Fields:**

- **`WhitelistedTokens`**: A key used to store the list of whitelisted token addresses in persistent storage.

**Key Structs and Storage Variants:**

- **`WhitelistKeys`**: Enum used to define storage keys.
  - **`WhitelistedTokens`**: Key used to store the list of whitelisted tokens.

### Token Allocations

Manages token allocations for shareholders. This structure keeps track of how many tokens each shareholder is entitled to and the total allocation for each token.

**Fields:**

- **`TotalAllocation(Address)`**: A key that maps a token address to the total allocation amount for that token.
- **`Allocation(Address, Address)`**: A key that maps a combination of a shareholder address and a token address to the allocation amount for that shareholder and token.

**Key Structs and Storage Variants:**

- **`DistributionKeys`**: Enum used to define storage keys.
  - **`TotalAllocation(Address)`**: Key for the total allocation amount for a token.
  - **`Allocation(Address, Address)`**: Key for mapping the allocation amount for a shareholder.

### Recipients

Manages the shareholders and their shares. This structure is used to store and retrieve information about the shareholders and their respective shares in the contract.

**Fields:**

- **`Shareholders`**: A key used to store the list of all shareholders in the contract.
- **`Share(Address)`**: A key that maps a shareholder address to their share information, represented by a `ShareDataKey` struct.

**Key Structs and Storage Variants:**

- **`RecipientKeys`**: Enum used to define storage keys.
  - **`Shareholders`**: Key used to store the list of shareholders.
  - **`Share(Address)`**: Key used to store the share information for a specific shareholder.

## Errors

The Splitter contract defines a set of errors to handle various failure conditions. Each error is represented by an enum variant with a unique code.

### Error Enum

**Variants:**

- **`NotInitialized` (101)**: The contract has not been initialized.
- **`AlreadyInitialized` (102)**: The contract has already been initialized.
- **`Unauthorized` (103)**: The caller is not authorized to perform the action.
- **`ContractLocked` (104)**: The contract is locked and cannot be modified.
- **`LowShareCount` (105)**: The share count is too low.
- **`SelfShareNotAllowed` (106)**: Self-sharing is not allowed.
- **`InvalidShareTotal` (107)**: The total shares are invalid.
- **`InsufficientBalance` (108)**: Insufficient balance for the operation.
- **`ZeroTransferAmount` (109)**: The transfer amount is zero.
- **`TransferAmountAboveBalance` (110)**: The transfer amount exceeds the balance.
- **`TransferAmountAboveUnusedBalance` (111)**: The transfer amount exceeds the unused balance.
- **`ZeroWithdrawalAmount` (112)**: The withdrawal amount is zero.
- **`WithdrawalAmountAboveAllocation` (113)**: The withdrawal amount exceeds the allocation.
- **`TokenNotWhitelisted` (114)**: The token is not whitelisted.
