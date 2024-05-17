# Sorosplits UI

This is the frontend repository for Sorosplits. The Sorosplits UI provides a user-friendly interface to interact with the Sorosplits smart contracts, enabling users to manage split transactions and revenue sharing across multiple parties in the Stellar ecosystem.

## Features

- **User-Friendly Interface**: Easily interact with the Sorosplits smart contracts.
- **Contract Management**: Deploy and manage Splitter and Diversifier contracts.
- **Token Distribution**: View and manage token distributions to shareholders.
- **Real-Time Updates**: Get real-time updates on contract states and token balances.

## Pre-requisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)

## Getting Started

To start the frontend, run the following commands:

```bash
yarn install
yarn dev
```

This will install the necessary dependencies and start the development server. You can then access the application in your browser at `http://localhost:3000`.

## Configuration

The frontend application requires configuration to connect to the Sorosplits smart contracts. Ensure you have the correct settings configured in your environment variables.

Create a `.env` file in the root of the project and add the following variables:

```env
# This is the backend server URL that is available in the backend repository
NEXT_PUBLIC_SERVER_URL="http://localhost:3001"
```

## Usage

Once the frontend is running, you can use the application to:

- **Deploy Contracts**: Deploy new Splitter and Diversifier contracts.
- **Initialize Contracts**: Initialize contracts with the necessary parameters.
- **Manage Shares**: Add, update, and view shareholder shares.
- **Distribute Tokens**: Distribute tokens to shareholders based on predefined shares.
- **Swap Tokens**: Use the Diversifier contract to swap tokens before distribution.

## Further Reading

For additional documentation on Sorosplits, visit the [Sorosplits Docs](https://docs.sorosplits.xyz).
