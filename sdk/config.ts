export type Network = "testnet" | "futurenet"

interface Config {
  network: Network
  rpcUrl: string
  networkPhrase: string
  adminWallet: string
  deployerContractId: string
  splitterWasmHash: string
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
  deployerContractId:
    "CDDFKGLR457OI6QXQ2REMS4YEL56DBUIKVH2ZCBKNGLUYWM52JMWSVNR",
  sorobanDomainsContractId:
    "CAPXARBAGOJO3HBPWTISP5JB35DWOX6GYWBZMIPH6A2XZIMISDA3762L",
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
  sorobanDomainsContractId: "",
}

const CONFIG: ConfigExport = {
  testnet: TESNET_CONFIG,
  futurenet: FUTURENET_CONFIG,
}

export default CONFIG
