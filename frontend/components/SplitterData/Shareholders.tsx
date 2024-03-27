import { useState } from "react"
import Text from "../Text"
import Card from "./Card"
import clsx from "clsx"
import Image from "next/image"
import AddressInput from "../Input/Address"
import ShareInput from "../Input/Share"
import { errorToast } from "@/utils/toast"
import { Keypair, StrKey } from "stellar-sdk"
import useContracts from "@/hooks/useContracts"
import Loading from "../Loading"

interface ShareholdersCardProps {
  data: {
    address: string
    share: string
    domain: boolean
  }[]
  edit: boolean
}

const ShareholdersCard: React.FC<ShareholdersCardProps> = ({ data, edit }) => {
  const { nameServiceContract } = useContracts()

  const [loading, setLoading] = useState(false)
  const [internalData, setInternalData] = useState(data)
  const [addressInput, setAddressInput] = useState("")
  const [shareInput, setShareInput] = useState("")

  const add = async () => {
    try {
      if (addressInput === "") throw new Error("Address is required")
      if (shareInput === "") throw new Error("Share is required")

      validateShare(shareInput)

      setLoading(true)
      const isDomain = await validateShareholder()
      setLoading(false)

      const newData = [
        ...internalData,
        { address: addressInput, share: shareInput, domain: isDomain },
      ]
      setInternalData(newData)
      setAddressInput("")
      setShareInput("")
    } catch (error: any) {
      setLoading(false)
      errorToast(error.message)
    }
  }

  const remove = (index: number) => {
    const newData = internalData.filter((_, i) => i !== index)
    setInternalData(newData)
  }

  const validateShareholder = async () => {
    if (
      internalData.some((shareholder) => shareholder.address === addressInput)
    ) {
      throw new Error("Address already exists in the list")
    }

    let isValid = false
    let isDomain = false
    try {
      Keypair.fromPublicKey(addressInput)
      isValid = true
    } catch (error) {
      try {
        StrKey.decodeContract(addressInput)
        isValid = true
      } catch (error) {
        const isValidDomain = await nameServiceContract.isValidDomainStr(
          addressInput
        )
        if (isValidDomain) {
          const userAddress = await nameServiceContract.parseDomainStr(
            addressInput
          )
          isValid = userAddress !== null
          isDomain = true
        }
      }
    }
    if (!isValid) {
      throw new Error("Invalid user, contract or domain address")
    }
    return isDomain
  }

  const validateShare = (share: string) => {
    const shareNumber = parseFloat(share)
    if (isNaN(shareNumber) || shareNumber <= 0 || shareNumber >= 100) {
      throw new Error("Share must be a number between 0 and 100")
    }
    const totalShares =
      internalData.reduce(
        (acc, current) => acc + parseFloat(current.share),
        0
      ) + shareNumber
    if (totalShares > 100) {
      throw new Error("Total shares cannot exceed 100%")
    }
  }

  return (
    <Card width="560">
      <div className="flex justify-between">
        <Text
          text={"Shareholders (" + internalData.length + ")"}
          size="14"
          lineHeight="16"
          letterSpacing="-1.5"
          color="#687B8C"
        />
        <Text
          text="Share"
          size="14"
          lineHeight="16"
          letterSpacing="-1.5"
          color="#687B8C"
        />
      </div>
      <div className="flex flex-col mt-3 gap-1">
        {internalData.map((item, index) => {
          return (
            <div key={item.address} className="flex items-center">
              <div
                className={clsx(
                  "h-[28px] w-full rounded-[8px] flex justify-between items-center px-1",
                  edit && "border-2 border-[#EBF2F7] p-4 px-2"
                )}
              >
                <Text
                  text={item.address}
                  size="12"
                  lineHeight="12"
                  letterSpacing="-1.5"
                />
                <Text
                  text={item.share + "%"}
                  size="12"
                  lineHeight="12"
                  letterSpacing="-1.5"
                />
              </div>
              {edit && (
                <button onClick={() => remove(index)}>
                  <Image
                    src="/icons/wrench.svg"
                    width={16}
                    height={16}
                    alt="Trash icon"
                    className="ml-2"
                  />
                </button>
              )}
            </div>
          )
        })}
        {edit && (
          <div className="flex flex-col items-center gap-1">
            <div className="flex w-full gap-1">
              <AddressInput
                placeholder="Enter shareholder address"
                onChange={(e) => setAddressInput(e.target.value)}
                value={addressInput}
              />
              <ShareInput
                onChange={(v) => setShareInput(v)}
                value={shareInput}
              />
            </div>
            <button
              className="relative h-[28px] w-full rounded-[8px] flex items-center p-4 px-2"
              onClick={add}
            >
              <div className="absolute top-0 right-0 bottom-0 left-0 rounded-[8px] bg-gradient-to-r from-[#EBF2F7] to-transparent z-0"></div>
              <div className="relative z-10 flex items-center w-full h-full">
                {loading ? (
                  <div className="ml-2">
                    <Loading small />
                  </div>
                ) : (
                  <>
                    <Image
                      src="/icons/wrench.svg"
                      width={14}
                      height={14}
                      alt="Add shareholder icon"
                      className="mr-2"
                    />
                    <Text
                      text="Add shareholder"
                      size="12"
                      lineHeight="12"
                      letterSpacing="-1.5"
                    />
                  </>
                )}
              </div>
              <Text
                text={`Share total: ${internalData.reduce(
                  (acc: number, { share }) => acc + Number(share),
                  0
                )}%`}
                size="12"
                lineHeight="12"
                letterSpacing="-1.5"
                rightAligned
              />
            </button>
          </div>
        )}
      </div>
    </Card>
  )
}

export default ShareholdersCard
