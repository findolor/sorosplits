import { isAllowed, isConnected, getUserInfo } from "@stellar/freighter-api"

export const checkFreighterConnection = async () => {
  const allowed = await isAllowed()
  if (!allowed) {
    throw new Error("Freighter not allowed")
  }
  const connected = await isConnected()
  if (!connected) {
    throw new Error("Freighter not connected")
  }
  const info = await getUserInfo()
  if (info.publicKey === "") {
    throw new Error("Please unlock your wallet")
  }
}
