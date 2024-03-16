import { useMemo } from "react"
import SoroSplitsSDK from "@sorosplits/sdk"
import useAppStore from "../store"

const useContracts = () => {
  const { walletAddress } = useAppStore()

  const splitterContract = useMemo(() => {
    return new SoroSplitsSDK.SplitterContract("testnet", walletAddress || "")
  }, [walletAddress])

  const tokenContract = useMemo(() => {
    return new SoroSplitsSDK.TokenContract("testnet", walletAddress || "")
  }, [walletAddress])

  const nameServiceContract = useMemo(() => {
    return new SoroSplitsSDK.NameServiceContract("testnet")
  }, [])

  return { splitterContract, tokenContract, nameServiceContract }
}

export default useContracts
