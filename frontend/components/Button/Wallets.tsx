import clsx from "clsx"
import React from "react"
import Text from "../Text"

interface BaseButtonProps {
  text: string
  onClick: () => void
  bgColor: string
}

const BaseButton: React.FC<BaseButtonProps> = ({ text, onClick, bgColor }) => {
  return (
    <button
      className={clsx(
        "w-30 h-8 flex justify-center items-center py-2 px-4 rounded-lg"
      )}
      style={{ backgroundColor: bgColor }}
      onClick={onClick}
    >
      <Text text={text} size="12" lineHeight="16" letterSpacing="-2" bold />
    </button>
  )
}

const formatAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

const ConnectWalletButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <BaseButton text="Connect wallet" onClick={onClick} bgColor="#FFDC93" />
  )
}

const AddressButton = ({ address }: { address: string }) => (
  <BaseButton
    text={formatAddress(address)}
    onClick={() => {}}
    bgColor="#93B8FF"
  />
)

const DisconnectWalletButton = ({ onClick }: { onClick: () => void }) => (
  <BaseButton text="Disconnect" onClick={onClick} bgColor="#FF9E9E" />
)

export { ConnectWalletButton, AddressButton, DisconnectWalletButton }
