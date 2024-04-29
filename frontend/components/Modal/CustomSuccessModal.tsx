import React from "react"
import Text from "../Text"
import BaseModal from "./Modal"
import { successToast } from "@/utils/toast"
import Image from "next/image"
import { truncateAddressLong } from "@/utils/truncateAddress"

interface CustomSuccessModalProps {
  isOpen: boolean
  onConfirm: () => void
  contractAddresses: {
    splitter: string
    diversifier: string
  }
}

const CustomSuccessModal: React.FC<CustomSuccessModalProps> = ({
  isOpen,
  onConfirm,
  contractAddresses,
}) => {
  const copyAddress = (contractAddress: string) => {
    navigator.clipboard.writeText(contractAddress)
    successToast("Address copied to clipboard")
  }

  return (
    <BaseModal
      size={450}
      isOpen={isOpen}
      bgColor="white"
      onOutsideClick={() => {}}
    >
      <div className="w-full flex flex-col items-center gap-4">
        <Text text="YOur contract is created balbala" />
        <div className="flex">
          <Text
            text={`Diversifier: ${truncateAddressLong(
              contractAddresses.diversifier
            )}`}
          />
          <button onClick={() => copyAddress(contractAddresses.diversifier)}>
            <Image
              src="/icons/copy.svg"
              height={18}
              width={18}
              alt="Copy icon"
            />
          </button>
        </div>
        <div className="flex">
          <Text
            text={`Splitter: ${truncateAddressLong(
              contractAddresses.splitter
            )}`}
          />
          <button onClick={() => copyAddress(contractAddresses.splitter)}>
            <Image
              src="/icons/copy.svg"
              height={18}
              width={18}
              alt="Copy icon"
            />
          </button>
        </div>
        <Text text="Do not forget to save your contract addresses!" />
        <button
          onClick={onConfirm}
          className="items p-4 border border-black rounded-lg"
        >
          <Text text="Acknowledge & Navigate to Contract" />
        </button>
      </div>
    </BaseModal>
  )
}

export default CustomSuccessModal
