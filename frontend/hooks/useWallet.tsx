import { isAllowed, setAllowed, getUserInfo } from "@stellar/freighter-api"
import useAppStore from "../store"
import { errorToast } from "../utils/toast"
import { getAccessToken } from '../services/authentication'

const useWallet = () => {
  const { isConnected, walletAddress, setIsConnected, setWalletAddress, setAccessToken } =
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

      const accessToken = await getAccessToken(info.publicKey)

      setWalletAddress(info.publicKey)
      setAccessToken(accessToken)
      setIsConnected(true)
    } catch (error: any) {
      errorToast(error)
    }
  }

  const disconnect = async () => {
    setIsConnected(false)
    setWalletAddress("")
    setAccessToken("null")
  }

  return {
    connect,
    disconnect,
    walletAddress,
    isConnected,
  }
}

export default useWallet
