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
    "8ca4b38d0b12977026c863d37dd1f896423c55ef2580afaae2597a7e91a80089",
  deployerContractId:
    "CAJPS7HMMAIFTXJUJ5A5TS7LBUA5Y6RJUWQPKJMMRJIRKJR5SAKGSWG2",
  sorobanDomainsContractId:
    "CAPXARBAGOJO3HBPWTISP5JB35DWOX6GYWBZMIPH6A2XZIMISDA3762L",
}

const CONFIG: ConfigExport = {
  testnet: TESNET_CONFIG,
}

export default CONFIG
