---
sidebar_position: 1
---

# Overview

The Diversifier Contract is a smart contract designed to enhance the functionality of the Splitter Contract by adding token swapping capabilities. Built using the Soroban SDK, it allows for the swapping of tokens before distributing them to shareholders, ensuring that the desired token is distributed.

## Use Case

Ideal for scenarios where token distributions need to be converted from one token to another before distribution, such as:

- **Token Conversion**: Converting raised funds in one token to another before distribution.
- **Liquidity Management**: Managing liquidity by swapping tokens before distribution.
- **Reward Distribution**: Distributing rewards in a specific token after converting from another token.

## Key Features

- **Token Swapping**: Swaps tokens before distribution, ensuring the desired token is distributed to shareholders.
- **Integration with Splitter Contract**: Leverages the Splitter Contract for distribution, ensuring transparent and efficient token distributions.
- **Admin-Centric Operations**: Sensitive operations, such as updating swap tokens or toggling the diversifier state, can only be performed by the admin.
- **Whitelisted Swap Tokens**: Ensures only approved tokens can be used for swapping, enhancing security and control.

## Error Management

The contract includes a comprehensive error handling system for initialization errors, unauthorized access, invalid swap paths, and more. Each error is represented by an enum variant with a unique code.

## Security Aspects

The contract's design includes several security features, such as admin-only functions and validation of swap tokens, to prevent unauthorized modifications and ensure the integrity of the token swapping and distribution process.

## Usage Scenarios

Ideal for organizations needing to convert and distribute tokens in a transparent, fair, and automated manner. Useful for DAOs, investment groups, and collaborative entities requiring a trustless system for token conversion and distribution.

## Further Reading

- [Execute Messages](./02-execute-messages.md)
- [Query Messages](./03-query-messages.md)
- [Data Structures & Errors](./04-data-structures-errors.md)
