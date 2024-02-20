import { create } from "zustand"

interface AppState {
  isConnected: boolean
  setIsConnected: (value: boolean) => void

  walletAddress: string | null
  setWalletAddress: (value: string) => void

  loading: boolean
  setLoading: (value: boolean) => void
}

const useAppStore = create<AppState>()((set) => ({
  isConnected: false,
  setIsConnected: (value: boolean) => set(() => ({ isConnected: value })),

  walletAddress: null,
  setWalletAddress: (value: string) => set(() => ({ walletAddress: value })),

  loading: false,
  setLoading: (value: boolean) => set(() => ({ loading: value })),
}))

export default useAppStore
