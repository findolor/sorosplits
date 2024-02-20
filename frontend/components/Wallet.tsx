import { useMemo } from "react"
import Button from "./Button"
import { FiLogOut } from "react-icons/fi"
import useWallet from "../hooks/useWallet"
import { successToast } from "../utils/toast"
import truncateAddress from "../utils/truncateAddress"

const Wallet = () => {
  const { isConnected, walletAddress, connect, disconnect } = useWallet()

  const displayFirstLastChars = useMemo(() => {
    return truncateAddress(walletAddress || "")
  }, [walletAddress])

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress || "")
    successToast("Copied address to clipboard")
  }

  return (
    <>
      {isConnected ? (
        <div className="flex items-center gap-2">
          <button
            onClick={copyAddress}
            className="w-[140px] h-10 flex items-center justify-center py-2 px-4 rounded-lg text-sm border-2 border-accent border-opacity-30 opacity-90 hover:bg-background-dark"
          >
            {displayFirstLastChars}
          </button>
          <button onClick={disconnect}>
            <FiLogOut color="black" size={14} />
          </button>
        </div>
      ) : (
        <Button text="Connect Wallet" onClick={connect} type="wallet" />
      )}
    </>
  )
}

export default Wallet
