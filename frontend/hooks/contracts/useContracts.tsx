import { useMemo } from "react"
import SorosplitsSDK from "@sorosplits/sdk"
import useAppStore from "../../store"

const useContracts = () => {
  const { walletAddress } = useAppStore()

  const splitterContract = useMemo(() => {
    return new SorosplitsSDK.SplitterContract("testnet", walletAddress || "")
  }, [walletAddress])

  const tokenContract = useMemo(() => {
    return new SorosplitsSDK.TokenContract("testnet", walletAddress || "")
  }, [walletAddress])

  const nameServiceContract = useMemo(() => {
    return new SorosplitsSDK.NameServiceContract("testnet")
  }, [])

  const deployerContract = useMemo(() => {
    return new SorosplitsSDK.DeployerContract("testnet", walletAddress || "")
  }, [walletAddress])

  const diversifierContract = useMemo(() => {
    return new SorosplitsSDK.DiversifierContract("testnet", walletAddress || "")
  }, [walletAddress])

  return {
    splitterContract,
    tokenContract,
    nameServiceContract,
    deployerContract,
    diversifierContract,
  }
}

export default useContracts
