import { create } from "zustand"

export interface TokenListItem {
  network: string
  assets: {
    code: string
    contract: string
    decimals: number
    icon: string
    name: string
  }[]
}

interface AppState {
  isConnected: boolean
  setIsConnected: (value: boolean) => void

  walletAddress: string | null
  setWalletAddress: (value: string) => void

  loading: boolean
  setLoading: (value: boolean) => void

  accessToken: string | null
  setAccessToken: (value: string) => void

  tokenList: TokenListItem[]
  setTokenList: (value: TokenListItem[]) => void
}

const useAppStore = create<AppState>()((set) => ({
  isConnected: false,
  setIsConnected: (value: boolean) => set(() => ({ isConnected: value })),

  walletAddress: null,
  setWalletAddress: (value: string) => set(() => ({ walletAddress: value })),

  loading: false,
  setLoading: (value: boolean) => set(() => ({ loading: value })),

  accessToken: null,
  setAccessToken: (value: string) => set(() => ({ accessToken: value })),

  tokenList: [],
  setTokenList: (value: TokenListItem[]) => set(() => ({ tokenList: value })),
}))

export default useAppStore
