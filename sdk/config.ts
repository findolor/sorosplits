export type Network = "testnet" | "mainnet"

interface Config {
  network: Network
  rpcUrl: string
  networkPhrase: string
  adminWallet: string
  deployerContractId: string
  splitterWasmHash: string
  diversifierWasmHash: string
  sorobanDomainsContractId: string
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
    "45ab441f58f4522c26a19271c91db08c4b943afe1b2624380b4769ef16e3b529",
  diversifierWasmHash:
    "bb216e2e8d825664c4310eaee7e6e823c8db64ca156ba78e64d1438145bdbd4a",
  deployerContractId:
    "CAF3LO5TVUK6G32MY2E2C7TKD6AO4HBPJIX446ABGYDNYNMOYAJ2YRSD",
  sorobanDomainsContractId:
    "CAPXARBAGOJO3HBPWTISP5JB35DWOX6GYWBZMIPH6A2XZIMISDA3762L",
}

const CONFIG: ConfigExport = {
  testnet: TESNET_CONFIG,
}

export default CONFIG
