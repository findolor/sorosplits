export type Network = "testnet" | "futurenet"

interface Config {
  network: Network
  rpcUrl: string
  networkPhrase: string
  deployerContractId: string
  splitterWasmHash: string
}

interface ConfigExport {
  [key: string]: Config
}

const TESNET_CONFIG: Config = {
  network: "testnet",
  rpcUrl: "https://soroban-testnet.stellar.org:443",
  networkPhrase: "Test SDF Network ; September 2015",
  splitterWasmHash:
    "b626d0e0d18e783346178ce8b841bbd8b0a49a5e003060f39838615986eac7e1",
  deployerContractId:
    "CB2WMMSG66I366CO6335U56UOEG3OU57YKNQICKR4LRVURG4L56XPW6L",
}

const FUTURENET_CONFIG: Config = {
  network: "futurenet",
  rpcUrl: "https://rpc-futurenet.stellar.org",
  networkPhrase: "Test SDF Future Network ; October 2022",
  // TODO: Update this hash
  splitterWasmHash:
    "b626d0e0d18e783346178ce8b841bbd8b0a49a5e003060f39838615986eac7e1",
  // TODO: Update this contract ID
  deployerContractId:
    "CB2WMMSG66I366CO6335U56UOEG3OU57YKNQICKR4LRVURG4L56XPW6L",
}

const CONFIG: ConfigExport = {
  testnet: TESNET_CONFIG,
  futurenet: FUTURENET_CONFIG,
}

export default CONFIG
