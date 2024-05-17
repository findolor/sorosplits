# Sorosplits Contracts

Sorosplits is a set of smart contracts and interfaces designed to enable split transactions and revenue sharing across multiple parties in the Stellar ecosystem. These contracts allow any assets (tokens) that exist on Stellar to be split in a trustless, automated, and transparent way across addresses. The user interface enables all Stellar community members and projects to leverage the technology as a public good.

## Contracts Overview

### Splitter Contract

The Splitter Contract is used to distribute tokens to shareholders with predefined shares. It ensures transparent and efficient token distributions according to predefined shares.

**Key Features:**

- **Immutable Data**: Prevents re-initialization of shareholder data unless marked as mutable.
- **Share Validation**: Ensures the sum of all shares equals exactly 100.
- **Admin-Centric Operations**: Sensitive operations can only be performed by the admin.
- **Token Distribution**: Distributes tokens based on shares.
- **Shareholder Transparency**: Shareholders can query their shares and the entire list of shareholders.

### Diversifier Contract

The Diversifier Contract is a wrapper around the Splitter Contract with added functionality for token swapping. Instead of distributing tokens directly, it swaps token A to token B and distributes B tokens.

**Key Features:**

- **Token Swapping**: Swaps tokens before distribution.
- **Integration with Splitter Contract**: Leverages the Splitter Contract for distribution.
- **Admin-Centric Operations**: Sensitive operations can only be performed by the admin.
- **Whitelisted Swap Tokens**: Ensures only approved tokens can be used for swapping.

### Deployer Contract

The Deployer Contract facilitates the deployment of other contracts, specifically the Splitter and Diversifier contracts. It ensures that the deployment and initialization of these contracts are atomic operations, preventing frontrunning and ensuring secure contract initialization.

**Key Features:**

- **Atomic Deployment and Initialization**: Ensures secure contract initialization.
- **Support for Multiple Contracts**: Supports the deployment of both Splitter and Diversifier contracts.
- **Flexible Initialization**: Allows for the initialization of deployed contracts with custom arguments.

## Pre-requisites

Read through [Soroban Docs](https://developers.stellar.org/docs/smart-contracts) for more information about the installation and usage of soroban-cli.

## Usage

To deploy the contracts in a single command, run the following script:

```bash
./scripts/deploy.sh
```
