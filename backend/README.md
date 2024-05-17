# Sorosplits Backend

The Sorosplits Backend is a Bun-based project that provides the backend services for the Sorosplits platform. It handles interactions with the Sorosplits smart contracts, manages user authentication, and provides APIs for the frontend to interact with the blockchain.

## Features

- **Smart Contract Interaction**: Facilitates communication with the Sorosplits smart contracts.
- **User Authentication**: Manages user authentication and authorization.
- **API Services**: Provides RESTful APIs for the frontend to interact with the blockchain.
- **Real-Time Updates**: Supports real-time updates for contract states and token balances.

## Pre-requisites

Ensure you have the following installed on your machine:

- [Bun](https://bun.sh/)

## Getting Started

To start the backend, run the following commands:

```bash
bun run start
```

## Configuration

The backend application requires configuration to connect to the Sorosplits smart contracts. Ensure you have the correct settings configured in your environment variables.

Create a `.env` file in the root of the project and add the following variables:

```env
# JWT_SECRET: A secret key used for signing and verifying JSON Web Tokens (JWTs) for authentication.
JWT_SECRET=

# DATABASE_URL: The MongoDB connection string for the database where the backend stores its data.
DATABASE_URL=

# SOROSWAP_BACKEND_URL: The URL of the Soroswap backend service that this application interacts with.
SOROSWAP_BACKEND_URL=

# SOROSWAP_API_KEY: The API key used to authenticate requests to the Soroswap backend service.
SOROSWAP_API_KEY=
```
