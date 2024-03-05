export type Network = "testnet" | "futurenet"

interface Config {
  network: Network
  rpcUrl: string
  networkPhrase: string
  adminWallet: string
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
  adminWallet: "GBOAWTUJNSI5VKE3MDGY32LJF723OCQ42XYLNJWXDHCJKRZSFV3PKKMY",
  splitterWasmHash:
    "90d9640c94769eae5a984158f7bc1445cf18f5402e9bf05d583ca0ef2751586f",
  deployerContractId:
    "CCYIPLDBZ2ZGWLGWNLPT6AMOVB5JJILYMTY3BA3AZ5KUCX4UZNJVJIZZ",
}

const FUTURENET_CONFIG: Config = {
  network: "futurenet",
  rpcUrl: "https://rpc-futurenet.stellar.org",
  networkPhrase: "Test SDF Future Network ; October 2022",
  adminWallet: "GBOAWTUJNSI5VKE3MDGY32LJF723OCQ42XYLNJWXDHCJKRZSFV3PKKMY",
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
