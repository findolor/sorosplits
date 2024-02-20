import { isAllowed, setAllowed, getUserInfo } from "@stellar/freighter-api"
import useAppStore from "../store"
import { errorToast } from "../utils/toast"

const useWallet = () => {
  const { isConnected, walletAddress, setIsConnected, setWalletAddress } =
    useAppStore()

  const connect = async () => {
    try {
      const allowed = await isAllowed()
      if (!allowed) {
        await setAllowed()
      }
      const info = await getUserInfo()
      if (info.publicKey === "") {
        return errorToast("Please unlock your wallet")
      }
      setWalletAddress(info.publicKey)
      setIsConnected(true)
    } catch (error: any) {
      errorToast(error)
    }
  }

  const disconnect = async () => {
    setIsConnected(false)
    setWalletAddress("")
  }

  return {
    connect,
    disconnect,
    walletAddress,
    isConnected,
  }
}

export default useWallet
