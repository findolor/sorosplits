# SoroSplit Contracts

SoroSplits is a set of smart contracts & interfaces to enable split transactions and revenue sharing across multiple parties in the Stellar ecosystem. 

SoroSplits would allow any assets (tokens) that exist on Stellar to be split in a trustless, automated, & transparent way across addresses and the user interface would enable all Stellar community members & projects to leverage the technology as a public good.

## Pre-requisites

Read through [Soroban Docs](https://soroban.stellar.org/docs/getting-started/setup) for more info about installation and usage of soroban-cli.

## Usage

Simple deployment and initialization of the SoroSplit contract can be done with running:

```bash
make
```

This command will execute the following steps:

1. Upload SoroSplit contract to the network

2. Upload the token contract to the network (included 
in the root of this repo)

3. Initialize the SoroSplit contract with the list of addresses to split the revenue with

```json
[
    {
        "shareholder": "<Random Address>",
        "share": 8050,
    },
    {
        "shareholder": "<Random Address>",
        "share": 1950,
    }
]
```

4. Mint 100 tokens to the SoroSplit contract using the token contract

5. Distribute the tokens to the shareholders using the SoroSplit contract

6. Display the balances of the shareholders
