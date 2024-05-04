import React, { useState } from "react"
import Text from "../Text"
import BaseModal from "./Modal"
import { successToast } from "@/utils/toast"
import Image from "next/image"
import clsx from "clsx"
import Link from "next/link"
import { handleWheel } from "@/utils/handleWheel"
import Switch from "../Switch"

export interface SuccessContractDetails {
  name: string
  splitter: string
  diversifier: string
}

interface CustomSuccessModalProps {
  isOpen: boolean
  onDownload: () => void
  onConfirm: () => void
  contracts: SuccessContractDetails[]
}

const CustomSuccessModal: React.FC<CustomSuccessModalProps> = ({
  isOpen,
  onDownload,
  onConfirm,
  contracts,
}) => {
  const [cont, setCont] = useState(false)

  return (
    <BaseModal
      size={615}
      isOpen={isOpen}
      bgColor="white"
      onOutsideClick={() => {}}
    >
      <div className="w-full flex flex-col items-center gap-5">
        <Image src="/checkmark.svg" height={50} width={50} alt="Checkmark" />
        <div className="flex flex-col gap-1">
          <Text
            text={`Your ${
              contracts.length > 1 ? "contracts are" : "contract is"
            } created successfully!`}
            bold
            size="22"
            lineHeight="28"
            centered
          />
          <Text
            text="Save your contract addresses by clicking copy icons or download as a file."
            size="13"
            lineHeight="20"
            centered
            color="#46535F"
            customStyle="px-1"
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
        <div
          className={clsx(
            "overflow-y-auto px-4",
            contracts.length > 1 ? "h-[250px]" : "h-fit"
          )}
          onWheel={handleWheel}
        >
          {contracts.map((address) => {
            return (
              <div
                key={address.diversifier}
                className="flex flex-col gap-2 mb-4 w-full"
              >
                <div className="flex flex-col items-start">
                  <Text
                    text={address.name}
                    size="18"
                    lineHeight="20"
                    color="black"
                    bold
                  />
                </div>
                <RenderContract
                  title="Main (Diversifier) Contract"
                  address={address.diversifier}
                />
                <RenderContract
                  title="Internal (Splitter) Contract"
                  address={address.splitter}
                />
              </div>
            )
          })}
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center">
            <Text
              text="I have saved the contract addresses"
              size="14"
              color="black"
              centered
            />
            <div className="ml-2">
              <Switch
                initialState={false}
                onChange={() => setCont(true)}
                locked={cont}
                reset={0}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onDownload}
              className="items py-2 px-8 bg-[#93B8FF] rounded-lg mt-4"
            >
              <Text text="Download Addresses" size="13" lineHeight="16" bold />
            </button>
            <button
              onClick={onConfirm}
              className={clsx(
                "items py-2 px-8 bg-[#FFDC93] rounded-lg mt-4",
                !cont && "opacity-50 cursor-not-allowed"
              )}
              disabled={!cont}
            >
              <Text text="Continue" size="13" lineHeight="16" bold />
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  )
}

const RenderContract = ({
  title,
  address,
}: {
  title: string
  address: string
}) => {
  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    successToast("Address copied to clipboard")
  }

  return (
    <div className="flex flex-col items-start">
      <Text text={title} size="13" lineHeight="20" centered color="#46535F" />
      <div className="flex items-center gap-2 w-full">
        <div className="flex border border-[#323C45] px-2 py-1 rounded-lg w-full">
          <Text
            text={address}
            size="13"
            lineHeight="20"
            centered
            color="#46535F"
          />
        </div>
        <button
          className="h-full flex items-center justify-center"
          onClick={copyAddress}
        >
          <Image src="/icons/copy.svg" height={20} width={20} alt="Copy icon" />
        </button>
      </div>
    </div>
  )
}

export default CustomSuccessModal
