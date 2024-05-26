---
sidebar_position: 1
---

# Overview

The Splitter Contract is a smart contract designed to automate the process of distributing tokens among a group of shareholders. Built using the Soroban SDK, it ensures transparent and efficient token distributions according to predefined shares.

## Use Case

Ideal for scenarios where multiple parties are entitled to a share of tokens, such as:

- **Revenue Sharing**: Distributing revenue to stakeholders.
- **Profit Distribution**: Allocating profits to partners or shareholders.
- **Token Airdrops**: Distributing tokens to early supporters or investors.
- **Crowdfunding**: Distributing raised funds to contributors.

## Key Features

- **Immutable Initialization**: Prevents re-initialization unless marked as mutable. Once initialized, the contract's configuration becomes immutable if the mutable flag is set to false.
- **Share Validation**: Ensures the sum of all shares equals exactly 10,000, simplifying percentage calculations and ensuring no share exceeds the total allocation.
- **Admin-Centric Operations**: Sensitive operations, such as updating shares or locking the contract, can only be performed by the admin, ensuring centralized control over critical operations.
- **Token Distribution**: Distributes tokens based on shares, ensuring rightful allocation. The `distribute_tokens` function can be called by anyone, allowing for flexible token distribution events.
- **Shareholder Transparency**: Shareholders can query their shares and the entire list of shareholders, promoting transparency within the system.
- **Contract Configuration Access**: Provides insights into the admin address and mutability state of the contract.

## Error Management

The contract includes a comprehensive error handling system for initialization errors, unauthorized access, share validation failures, and more. Each error is represented by an enum variant with a unique code.

## Security Aspects

The contract's design includes several security features, such as admin-only functions and share total validation, to prevent unauthorized modifications and ensure the integrity of the token distribution process.

## Usage Scenarios

Ideal for organizations needing to distribute profits, dividends, or rewards in a transparent, fair, and automated manner. Useful for DAOs, investment groups, and collaborative entities requiring a trustless system for token distribution.

## Further Reading

- [Execute Messages](./02-execute-messages.md)
- [Query Messages](./03-query-messages.md)
- [Data Structures & Errors](/smart-contracts/splitter/04-data-structures.md)
