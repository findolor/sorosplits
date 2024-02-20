---
sidebar_position: 3
---

# Query Messages

Query messages are used to retrieve information from the Splitter Contract without altering its state. These messages are essential for obtaining current data regarding shares, shareholders, and contract configuration.

## Query Message Functions

### `get_share`

Retrieves the share associated with a specific shareholder.

**Parameters:**

- **`shareholder`**: The address of the shareholder whose share is to be queried.

**Returns:**

- **`Option<i128>`**: The share of the specified shareholder if they exist, or None if the shareholder does not have a share.

### `list_shares`

Lists all shareholders and their corresponding shares.

**Parameters:** None

**Returns:**

- **`Vec<ShareDataKey>`**: A vector of `ShareDataKey` structs, each containing a shareholder's address and their share.

### `get_config`

Retrieves the current configuration of the contract.

**Parameters:** None

**Returns:**

- **`ConfigDataKey`**: The `ConfigDataKey` struct containing the admin address and the mutability state of the contract.
