import {
  isAllowed,
  setAllowed,
  getUserInfo,
  signBlob,
} from "@stellar/freighter-api"
import useAppStore from "../store"
import { errorToast } from "../utils/toast"
import useApiService from "./useApi"

const useWallet = () => {
  const {
    isConnected,
    walletAddress,
    setIsConnected,
    setWalletAddress,
    setAccessToken,
  } = useAppStore()
  const { authenticationApiService } = useApiService()

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

      let publicKey = info.publicKey

      const nonce = await authenticationApiService.getNonce({ publicKey })

      const signedBlob = (await signBlob(
        btoa(
          JSON.stringify({
            message: "SoroSplits connection message for authentication",
            nonce,
          })
        ),
        {
          accountToSign: publicKey,
        }
      )) as unknown as { data: Uint8Array }

      const accessToken = await authenticationApiService.connect({
        signature: Buffer.from(signedBlob.data).toString("base64"),
        publicKey,
      })

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
