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
    "7eb7e3702b72d3c132cdbc9372dc629bf4843e29df7aa20319265379c996cd59",
  diversifierWasmHash:
    "0ba26c391f2deb031230dfd6235f1e2d9af54fdc04c9bf8ddfbae01f7f593420",
  deployerContractId:
    "CD2U5LQX7Q57X2VQ3LUMKAX2FO5RHUTWMBW7NPY7X5F2T7PTADZPAHL6",
  sorobanDomainsContractId:
    "CAPXARBAGOJO3HBPWTISP5JB35DWOX6GYWBZMIPH6A2XZIMISDA3762L",
}

const CONFIG: ConfigExport = {
  testnet: TESNET_CONFIG,
}

export default CONFIG
