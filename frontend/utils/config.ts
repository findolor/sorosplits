interface Config {
  network: string
  rpcUrl: string
  networkPhrase: string
  deployerContractId: string
  splitterWasmHash: string
}

export const CONFIG: Config = {
  network: process.env.NEXT_PUBLIC_NETWORK || "",
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "",
  networkPhrase: process.env.NEXT_PUBLIC_NETWORK_PHRASE || "",
  splitterWasmHash: process.env.NEXT_PUBLIC_SPLITTER_WASM_HASH || "",
  deployerContractId: process.env.NEXT_PUBLIC_DEPLOYER_CONTRACT_ID || ""
}

export const config = CONFIG
