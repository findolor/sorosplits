echo "1. Creating two shareholder identities \n"
soroban config identity generate --global sorosplit_shareholder1
soroban config identity generate --global sorosplit_shareholder2
SOROSPLIT_SHAREHOLDER1_IDENTITY=$(soroban config identity address sorosplit_shareholder1)
SOROSPLIT_SHAREHOLDER2_IDENTITY=$(soroban config identity address sorosplit_shareholder2)

echo "2. Initializing the splitter contract \n"
soroban contract invoke \
  --id $(cat scripts/splitter_contract_id) \
  --source sorosplit-test \
  --network futurenet \
  -- \
  init \
  --admin $(cat scripts/test_identity) \
  --shares '[{"shareholder":"'${SOROSPLIT_SHAREHOLDER1_IDENTITY}'", "share": "8050"},{"shareholder":"'${SOROSPLIT_SHAREHOLDER2_IDENTITY}'", "share": "1950"}]' \
  --mutable true

echo "3. Initializing and minting 100 tokens to splitter contract \n"
soroban contract invoke \
  --id $(cat scripts/token_contract_id) \
  --source sorosplit-test \
  --network futurenet \
  -- \
  initialize \
  --admin $(cat scripts/test_identity) \
  --decimal 7 \
  --name "Custom Token" \
  --symbol "CTK"
soroban contract invoke \
  --id $(cat scripts/token_contract_id) \
  --source sorosplit-test \
  --network futurenet \
  -- \
  mint \
  --to $(cat scripts/splitter_contract_id) \
  --amount 1000000000

echo "4. Distributing tokens to shareholders \n"
soroban contract invoke \
  --id $(cat scripts/splitter_contract_id) \
  --source sorosplit-test \
  --network futurenet \
  -- \
  distribute_tokens \
  --token_address $(cat scripts/token_contract_id)

echo "5. Checking balances \n"
echo "Shareholder 1 balance: $(soroban contract invoke \
  --id $(cat scripts/token_contract_id) \
  --source sorosplit-test \
  --network futurenet \
  -- \
  balance \
  --id $SOROSPLIT_SHAREHOLDER1_IDENTITY)"
echo "Shareholder 2 balance: $(soroban contract invoke \
  --id $(cat scripts/token_contract_id) \
  --source sorosplit-test \
  --network futurenet \
  -- \
  balance \
  --id $SOROSPLIT_SHAREHOLDER2_IDENTITY)"

exit 0