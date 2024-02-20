#!/bin/bash

SOROBAN_RPC_URL="https://soroban-testnet.stellar.org"
SOROBAN_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
NETWORK="testnet"

echo "1. Addding testnet to soroban config"
soroban config network add --global testnet \
  --rpc-url "$SOROBAN_RPC_URL" \
  --network-passphrase "$SOROBAN_NETWORK_PASSPHRASE"

echo "2. Creating new wallet called "sorosplits-wallet" "
soroban config identity generate --global sorosplits-wallet \
  --rpc-url "$SOROBAN_RPC_URL" \
  --network-passphrase "$SOROBAN_NETWORK_PASSPHRASE" \
  --network "$NETWORK"

export SOROSPLITS_WALLET=$(soroban config identity address sorosplits-wallet)
echo "3. New wallet "sorosplit-wallet" created: $(echo $SOROSPLITS_WALLET) "
printf "%s" "$SOROSPLITS_WALLET" > scripts/artifacts/sorosplits_wallet

curl "https://friendbot.stellar.org/?addr=$(echo $SOROSPLITS_WALLET)"
echo "4. Funding the new wallet with friendbot. "

echo "5. Building contracts "
soroban contract build

echo "6. Uploding the splitter contract to the network"
export SPLITTER_CONTRACT_WASM_HASH=$(soroban contract install \
  --wasm target/wasm32-unknown-unknown/release/sorosplits_splitter.wasm \
  --source sorosplits-wallet \
  --network testnet)
printf "%s" "$SPLITTER_CONTRACT_WASM_HASH" > scripts/artifacts/splitter_contract_wasm_hash

echo "7. Deploying the deployer contract to the network"
export DEPLOYER_CONTRACT_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/sorosplits_deployer.wasm \
  --source sorosplits-wallet \
  --network testnet)
printf "%s" "$DEPLOYER_CONTRACT_ID" > scripts/artifacts/deployer_contract_id

echo "8. Deploying the token contract to the network"
export TOKEN_CONTRACT_ID=$(soroban contract deploy \
  --wasm token_contract.wasm \
  --source sorosplits-wallet \
  --network testnet)
printf "%s" "$TOKEN_CONTRACT_ID" > scripts/artifacts/token_contract_id

echo "9. Contract deployment complete. "
echo "Contract details: "

echo "Splitter Contract Wasm Hash: $SPLITTER_CONTRACT_WASM_HASH"
echo "Deployer Contract ID: $DEPLOYER_CONTRACT_ID"
echo "Token Contract ID: $TOKEN_CONTRACT_ID"

exit 0