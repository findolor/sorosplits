---
sidebar_position: 4
---

# Data Structures & Errors

## Data Structures

### `Vec<ShareDataKey>`

A vector that holds elements of the `ShareDataKey`` type. It is used to store and manage the list of shareholders and their respective shares.

### `ShareDataKey`

A custom data structure that represents a shareholder's information, including:

- **shareholder** - `Address`: The blockchain address of the shareholder.
- **share** - `i128`: The amount of share the shareholder owns, represented as an integer.

This structure is used to map each shareholder to their allocated share of the tokens.

### `ConfigDataKey`

A data structure that holds the configuration details of the contract, which includes:

- **admin** - `Address`: The blockchain address of the admin who has the authority to execute admin-level operations.
- **mutable** - `bool`: A boolean flag indicating whether the contract is mutable (i.e., whether the shares and other configurations can be updated post-initialization).

This structure is crucial for maintaining the state of the contract, including administrative control and mutability status.

## Errors

An enumeration that defines the possible error states that the contract can encounter, such as:

- **AlreadyInitialized**: Indicates that the contract has already been initialized and cannot be re-initialized.
- **NotInitialized**: Indicates that the contract has not been initialized and therefore cannot perform the requested operation.
- **InvalidShareTotal**: Indicates that the total shares do not sum up to the required total (10,000).
- **LowShareCount**: Indicates that there is an insufficient number of shareholders (less than the required minimum).