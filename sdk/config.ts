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
    "5a89d0a5173975a4ea4a73ef298b055d5215a62c8e1f3f5a8086b95421a9a8fb",
  diversifierWasmHash: "",
  deployerContractId:
    "CDDFKGLR457OI6QXQ2REMS4YEL56DBUIKVH2ZCBKNGLUYWM52JMWSVNR",
  sorobanDomainsContractId:
    "CAPXARBAGOJO3HBPWTISP5JB35DWOX6GYWBZMIPH6A2XZIMISDA3762L",
}

const CONFIG: ConfigExport = {
  testnet: TESNET_CONFIG,
}

export default CONFIG
