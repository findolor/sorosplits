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
    "e79fcae2d78c91fdc7271132186fed1ed9903dcd72b8a7284542027dfed78138",
  diversifierWasmHash:
    "2e61a03d28cfe48d76d50dcd015064b3104d7658d57aa519e9786b4a622127f7",
  deployerContractId:
    "CC6GWVZGNUCAWJ75GFM2TU7F4VWGL4GUCS6JY2FZ6OURZTMJ73S376QA",
  sorobanDomainsContractId:
    "CAPXARBAGOJO3HBPWTISP5JB35DWOX6GYWBZMIPH6A2XZIMISDA3762L",
}

const CONFIG: ConfigExport = {
  testnet: TESNET_CONFIG,
}

export default CONFIG
