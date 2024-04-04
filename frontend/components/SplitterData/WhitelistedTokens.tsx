import { useEffect, useState } from "react"
import AddressInput from "../Input/Address"
import Text from "../Text"
import Card from "./Card"
import Loading from "../Loading"
import Image from "next/image"
import { errorToast } from "@/utils/toast"
import clsx from "clsx"
import useAppStore from "@/store/index"
import useToken from "@/hooks/useToken"
import { getBalance } from "@/utils/getBalance"

export interface WhitelistedTokensCardData {
  address: string
  name: string
  symbol: string
  decimals: number
  balance: string
}

interface WhitelistedTokensCardProps {
  contractAddress: string
  data: WhitelistedTokensCardData[]
  dataLoading?: boolean
  onUpdate: (data: WhitelistedTokensCardData[]) => void
  edit: boolean
  reset?: number
  disabled?: boolean
}

const WhitelistedTokensCard: React.FC<WhitelistedTokensCardProps> = ({
  contractAddress,
  data,
  dataLoading,
  onUpdate,
  edit,
  reset,
}) => {
  const { loading, setLoading } = useAppStore()
  const token = useToken()

  const [internalData, setInternalData] = useState(data)
  const [addressInput, setAddressInput] = useState("")

  useEffect(() => {
    setInternalData(data)
  }, [edit, reset])

  const add = async () => {
    try {
      if (addressInput === "") throw new Error("Address is required")

      setLoading(true)
      const tokenData = await validateTokenAddress()
      setLoading(false)

      const balance = await token.query.getBalance(
        addressInput,
        contractAddress
      )

      const newData = [
        ...internalData,
        {
          address: addressInput,
          name: tokenData.name,
          symbol: tokenData.symbol,
          decimals: tokenData.decimals,
          balance: getBalance(balance, tokenData.decimals).toFixed(2),
        },
      ]
      setInternalData(newData)
      onUpdate(newData)
      setAddressInput("")
    } catch (error: any) {
      setLoading(false)
      errorToast(error.message)
    }
  }

  const remove = (index: number) => {
    const newData = internalData.filter((_, i) => i !== index)
    setInternalData(newData)
    onUpdate(newData)
  }

  const validateTokenAddress = async () => {
    if (internalData.some((token) => token.address === addressInput)) {
      throw new Error("Address already exists in the list")
    }

    const res = await Promise.all([
      token.query.getName(addressInput),
      token.query.getSymbol(addressInput),
      token.query.getDecimal(addressInput),
    ])

    if (!res) {
      throw new Error("Token query failed")
    }

    return {
      name: res[0] as string,
      symbol: res[1] as string,
      decimals: res[2] as number,
    }
  }

  return (
    <Card width="560">
      <div className="flex justify-between">
        <Text
          text="Whitelisted Tokens"
          size="14"
          lineHeight="16"
          letterSpacing="-1.5"
          color="#687B8C"
        />
        <div className="flex items-center gap-4">
          <Text
            text="Balance"
            size="14"
            lineHeight="16"
            letterSpacing="-1.5"
            color="#687B8C"
          />
          <Text
            text="Symbol"
            size="14"
            lineHeight="16"
            letterSpacing="-1.5"
            color="#687B8C"
          />
          <Text
            text="Decimals"
            size="14"
            lineHeight="16"
            letterSpacing="-1.5"
            color="#687B8C"
          />
        </div>
      </div>
      <div className="flex flex-col mt-3 gap-1">
        {dataLoading && <Loading small />}
        {!dataLoading && (edit ? internalData : data).length === 0 && !edit && (
          <div className="flex w-full gap-3">
            <Image
              src="/icons/info.svg"
              height={12}
              width={12}
              alt="Info icon"
            />
            <Text
              text="This contract does not have any balance"
              size="12"
              color="#687B8C"
            />
          </div>
        )}
        {!dataLoading &&
          (edit ? internalData : data).map((item, index) => {
            return (
              <div className="flex items-center" key={item.address}>
                <div
                  className={clsx(
                    "h-[28px] w-full rounded-[8px] flex justify-between items-center px-1",
                    edit && "border-2 border-[#EBF2F7] p-4 px-2"
                  )}
                >
                  <Text
                    text={item.name}
                    size="12"
                    lineHeight="12"
                    letterSpacing="-1.5"
                  />
                  <div className="flex items-center">
                    <Text
                      text={item.balance}
                      size="12"
                      lineHeight="12"
                      letterSpacing="-1.5"
                    />
                    <div className="w-[65px] flex justify-end">
                      <Text
                        text={item.symbol}
                        size="12"
                        lineHeight="12"
                        letterSpacing="-1.5"
                      />
                    </div>
                    <div className="w-[75px] flex justify-end">
                      <Text
                        text={item.decimals.toString()}
                        size="12"
                        lineHeight="12"
                        letterSpacing="-1.5"
                      />
                    </div>
                  </div>
                </div>
                {edit && (
                  <button onClick={() => remove(index)}>
                    <Image
                      src="/icons/trash.svg"
                      width="12"
                      height="12"
                      alt="Trash icon"
                      className="ml-2 h-[28px]"
                    />
                  </button>
                )}
              </div>
            )
          })}
      </div>
      {edit && (
        <div className="flex flex-col items-center gap-1 mt-1">
          <div className="flex w-full gap-1">
            <AddressInput
              placeholder="Enter token address"
              onChange={(e) => setAddressInput(e.target.value)}
              value={addressInput}
              disabled={loading}
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
                    text="Add whitelisted token"
                    size="12"
                    lineHeight="12"
                    letterSpacing="-1.5"
                  />
                </>
              )}
            </div>
          </button>
        </div>
      )}
    </Card>
  )
}

export default WhitelistedTokensCard
