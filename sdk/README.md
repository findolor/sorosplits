# Sorosplits SDK

## Installation

```bash
npm install sorosplits-sdk
```

## Overview

The Sorosplits SDK provides a set of tools to interact with the Sorosplits smart contracts on the Stellar network. It includes classes for each contract and hooks for easy integration with React applications.

## Usage

### Regular Usage

To use the SDK in a regular TypeScript environment, you can create instances of the contract classes and call their methods directly.

```typescript
import {
  SplitterContract,
  DiversifierContract,
  DeployerContract,
} from "sorosplits-sdk"

// Initialize
const deployer = new DeployerContract("testnet", "user-wallet-address")
const splitter = new SplitterContract("testnet", "user-wallet-address")

// Example: Deploy and initialize a Diversifier contract
await deployer.deployDiversifier({
  name: "My Diversifier Contract",
  shares: [
    {
      shareholder: "shareholder-wallet-address",
      share: 4000,
    },
    {
      shareholder: "shareholder-wallet-address",
      share: 6000,
    },
  ],
  updatable: true,
  isDiversifierActive: true,
})

// Example: Update shareholder and shares
await diversifier.call({
  contractId: "contract-id",
  method: "update_shares",
  args: {
    shares: [
      {
        shareholder: "shareholder-wallet-address",
        share: 2000,
      },
      {
        shareholder: "shareholder-wallet-address",
        share: 3000,
      },
      {
        shareholder: "shareholder-wallet-address",
        share: 5000,
      },
    ],
  },
})

// Example: Swap and distribute tokens using the Diversifier contract
await diversifier.call({
  contractId: "contract-id",
  method: "swap_and_distribute_tokens",
  args: {
    swapPath: ["tokenA", "tokenB"],
    amount: 1000,
  },
})
```

### React Usage

To use the SDK in a React application, you can use the provided hooks to interact with the contracts.

```tsx
import { useSplitterContract, useDeployerContract } from "sorosplits-sdk"

const MyComponent = () => {
  const splitter = useSplitterContract("testnet", "user-wallet-address")
  const deployer = useDeployerContract("testnet", "user-wallet-address")

  // Example: Distribute tokens
  const distributeTokens = async () => {
    await splitter.call({
      contractId: "contract-id",
      method: "distribute_tokens",
      args: {
        tokenAddress: "token-address",
        amount: 1000,
      },
    })
  }

  // Example: Create network
  const createNetwork = async () => {
    await deployer.deployNetwork({
      data: [
        {
          id: 1,
          salt: Buffer.from("random_salt_1"),
          isDiversifierActive: true,
          splitterData: {
            name: "Contract 1",
            shares: [
              {
                shareholder: "shareholder-wallet-address-1",
                share: 4000,
              },
              {
                shareholder: "shareholder-wallet-address-2",
                share: 3000,
              },
            ],
            updatable: true,
          },
          outputContracts: [
            {
              id: 2,
              share: 3000,
            },
          ],
        },
        {
          id: 2,
          salt: Buffer.from("random_salt_2"),
          isDiversifierActive: false,
          splitterData: {
            name: "Contract 2",
            shares: [
              {
                shareholder: "shareholder-wallet-address-3",
                share: 6000,
              },
              {
                shareholder: "shareholder-wallet-address-4",
                share: 4000,
              },
            ],
            updatable: false,
          },
          outputContracts: [],
        },
      ],
    })
  }

  return (
    <div>
      <button onClick={distributeTokens}>Distribute Tokens</button>
      <button onClick={distributeTokens}>Create Network</button>
    </div>
  )
}
```
