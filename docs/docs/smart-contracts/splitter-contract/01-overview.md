---
sidebar_position: 1
---

# Overview

The Splitter Contract is a smart contract designed to automate the process of distributing tokens among a group of shareholders. It is built using the Soroban SDK, which provides a robust framework for developing contracts on the platform. The contract operates with a high degree of transparency and efficiency, ensuring that token distributions are carried out fairly and consistently according to the predefined shares assigned to each shareholder.

## Key Features

- **Immutable Initialization**: Once the contract is initialized with the admin's address, shareholders' information, and mutability preference, it cannot be re-initialized. This prevents any alteration of the fundamental setup unless the contract is explicitly marked as mutable.
- **Share Validation**: The contract enforces that the sum of all shareholders' shares equals exactly 10,000, a mechanism that simplifies the calculation of percentages and ensures that no share exceeds the total allocation.
- **Admin-Centric Operations**: Certain sensitive operations, such as updating shareholder information or locking the contract to prevent further updates, can only be performed by the admin, adding a layer of security and control.
- **Token Distribution**: The token distribution function allows for the distribution of tokens to shareholders based on their respective shares. This function can be triggered by any user, but the actual distribution logic ensures that only the rightful shareholders receive their tokens.
- **Shareholder Transparency**: Shareholders can query their individual shares and the entire list of shareholders and their shares, promoting transparency within the system.
- **Contract Configuration Access**: The contract's configuration can be retrieved, providing insights into the current admin address and the mutability state of the contract.

## Error Management

The contract is equipped with a comprehensive error handling system that categorizes and responds to various error conditions such as initialization errors, unauthorized access, and share validation failures.

## Security Aspects

The contract's design includes several security features, such as admin-only functions and share total validation, to prevent unauthorized modifications and ensure the integrity of the token distribution process.

## Usage Scenarios

The Splitter Contract is ideal for organizations that need to distribute profits, dividends, or any form of rewards to a group of stakeholders in a transparent, fair, and automated manner. It is particularly useful for decentralized autonomous organizations (DAOs), investment groups, and any collaborative entity that requires a trustless system to distribute tokens.
