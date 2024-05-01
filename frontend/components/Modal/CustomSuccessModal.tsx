import React, { useState } from "react"
import Text from "../Text"
import BaseModal from "./Modal"
import { successToast } from "@/utils/toast"
import Image from "next/image"
import { truncateAddressLong } from "@/utils/truncateAddress"
import clsx from "clsx"
import Link from "next/link"

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
  const [isDisabled, setIsDisabled] = useState([true, true])

  const copyAddress = (contractAddress: string) => {
    navigator.clipboard.writeText(contractAddress)
    successToast("Address copied to clipboard")
  }

  return (
    <BaseModal
      size={600}
      isOpen={isOpen}
      bgColor="white"
      onOutsideClick={() => {}}
    >
      <div className="w-full flex flex-col items-center gap-5">
        <Image src="/checkmark.svg" height={50} width={50} alt="Checkmark" />
        <div className="flex flex-col gap-1">
          <Text
            text="Your contract is created successfully!"
            bold
            size="22"
            lineHeight="28"
          />
          <Text
            text="Make sure to copy both contract addresses below."
            size="13"
            lineHeight="20"
            centered
            color="#46535F"
          />
          <div className="flex items-center justify-center">
            <Text
              text="Look at the"
              size="13"
              lineHeight="20"
              centered
              color="#46535F"
            />
            &nbsp;
            <Link href="https://docs.sorosplits.xyz/" target="_blank">
              <Text
                text="docs"
                size="13"
                lineHeight="20"
                centered
                color="#46535F"
                customStyle="underline"
              />
            </Link>
            &nbsp;
            <Text
              text="for more information about the contracts."
              size="13"
              lineHeight="20"
              centered
              color="#46535F"
            />
          </div>
        </div>
        <div className="flex flex-col items-start">
          <Text
            text="Main (Diversifier) Contract"
            size="13"
            lineHeight="20"
            centered
            color="#46535F"
          />
          <div className="flex items-center gap-2">
            <div className="border border-[#323C45] px-2 py-1 rounded-lg">
              <Text
                text={contractAddresses.diversifier}
                size="13"
                lineHeight="20"
                centered
                color="#46535F"
              />
            </div>
            <button
              className="h-full w-full flex items-center justify-center"
              onClick={() => {
                copyAddress(contractAddresses.diversifier)
                setIsDisabled([false, isDisabled[1]])
              }}
            >
              <Image
                src="/icons/copy.svg"
                height={20}
                width={20}
                alt="Copy icon"
              />
            </button>
          </div>
        </div>
        <div className="flex flex-col items-start">
          <Text
            text="Internal (Splitter) Contract"
            size="13"
            lineHeight="20"
            centered
            color="#46535F"
          />
          <div className="flex items-center gap-2">
            <div className="border border-[#323C45] px-2 py-1 rounded-lg">
              <Text
                text={contractAddresses.splitter}
                size="13"
                lineHeight="20"
                centered
                color="#46535F"
              />
            </div>
            <button
              className="h-full w-full flex items-center justify-center"
              onClick={() => {
                copyAddress(contractAddresses.splitter)
                setIsDisabled([isDisabled[0], false])
              }}
            >
              <Image
                src="/icons/copy.svg"
                height={20}
                width={20}
                alt="Copy icon"
              />
            </button>
          </div>
        </div>
        <button
          onClick={onConfirm}
          className={clsx(
            "items py-2 px-8 bg-[#FFDC93] rounded-lg mt-4",
            (isDisabled[0] || isDisabled[1]) && "opacity-50"
          )}
          disabled={isDisabled[0] || isDisabled[1]}
        >
          <Text text="Continue" size="13" lineHeight="16" bold />
        </button>
      </div>
    </BaseModal>
  )
}

export default CustomSuccessModal
