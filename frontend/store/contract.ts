import { ShareholderCardData } from "@/components/SplitterData/Shareholders"
import { WhitelistedSwapTokensCardData } from "@/components/SplitterData/WhitelistedSwapTokens"
import { WhitelistedTokensCardData } from "@/components/SplitterData/WhitelistedTokens"
import { create } from "zustand"

interface ContractState {
  contractAddresses: {
    diversifier: string
    splitter: string
  }
  setContractAddresses: (value: {
    diversifier: string
    splitter: string
  }) => void

  owner: string
  setOwner: (value: string) => void

  name: string
  setName: (value: string) => void

  updatable: boolean
  setUpdatable: (value: boolean) => void

  isDiversifierActive: boolean
  setIsDiversifierActive: (value: boolean) => void

  shareholders: ShareholderCardData[]
  setShareholders: (value: ShareholderCardData[]) => void

  whitelistedTokens: WhitelistedTokensCardData[]
  setWhitelistedTokens: (value: WhitelistedTokensCardData[]) => void

  whitelistedSwapTokens: WhitelistedSwapTokensCardData[]
  setWhitelistedSwapTokens: (value: WhitelistedSwapTokensCardData[]) => void

  setAllContractData: ({
    contractAddresses,
    owner,
    name,
    updatable,
    isDiversifierActive,
    shareholders,
    whitelistedTokens,
    whitelistedSwapTokens,
  }: {
    contractAddresses: { diversifier: string; splitter: string }
    owner: string
    name: string
    updatable: boolean
    isDiversifierActive: boolean
    shareholders: ShareholderCardData[]
    whitelistedTokens: WhitelistedTokensCardData[]
    whitelistedSwapTokens: WhitelistedSwapTokensCardData[]
  }) => void

  resetContractData: () => void
}

const useContractStore = create<ContractState>()((set) => ({
  contractAddresses: {
    diversifier: "",
    splitter: "",
  },
  setContractAddresses: (value: { diversifier: string; splitter: string }) =>
    set(() => ({ contractAddresses: value })),

  owner: "",
  setOwner: (value: string) => set(() => ({ owner: value })),

  name: "",
  setName: (value: string) => set(() => ({ name: value })),

  updatable: false,
  setUpdatable: (value: boolean) => set(() => ({ updatable: value })),

  isDiversifierActive: false,
  setIsDiversifierActive: (value: boolean) =>
    set(() => ({ isDiversifierActive: value })),

  shareholders: [],
  setShareholders: (value: ShareholderCardData[]) =>
    set(() => ({ shareholders: value })),

  whitelistedTokens: [],
  setWhitelistedTokens: (value: WhitelistedTokensCardData[]) =>
    set(() => ({ whitelistedTokens: value })),

  whitelistedSwapTokens: [],
  setWhitelistedSwapTokens: (value: WhitelistedSwapTokensCardData[]) =>
    set(() => ({ whitelistedSwapTokens: value })),

  setAllContractData: ({
    contractAddresses,
    owner,
    name,
    updatable,
    isDiversifierActive,
    shareholders,
    whitelistedTokens,
    whitelistedSwapTokens,
  }) => {
    set(() => ({
      contractAddresses,
      owner,
      name,
      updatable,
      isDiversifierActive,
      shareholders,
      whitelistedTokens,
      whitelistedSwapTokens,
    }))
  },

  resetContractData: () =>
    set(() => ({
      contractAddresses: {
        diversifier: "",
        splitter: "",
      },
      owner: "",
      name: "",
      updatable: false,
      isDiversifierActive: false,
      shareholders: [],
      whitelistedTokens: [],
      whitelistedSwapTokens: [],
    })),
}))

export default useContractStore
