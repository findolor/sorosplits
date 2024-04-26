import { useEffect, useMemo, useState } from "react"
import AddressInput from "../Input/Address"
import Text from "../Text"
import Card from "./Card"
import Loading from "../Loading"
import Image from "next/image"
import { errorToast } from "@/utils/toast"
import clsx from "clsx"
import useAppStore from "@/store/index"
import useToken from "@/hooks/contracts/useToken"

export interface WhitelistedTokensCardData {
  address: string
  name: string
  symbol: string
  decimals: number
}

export interface WhitelistedSwapTokensCardData {
  token: WhitelistedTokensCardData
  swapTokens: WhitelistedTokensCardData[]
}

interface WhitelistedSwapTokensCardProps {
  data: WhitelistedSwapTokensCardData[]
  dataLoading?: boolean
  onUpdate: (data: WhitelistedSwapTokensCardData[]) => void
  edit: boolean
  reset?: number
  disabled?: boolean
  create?: boolean
}

const WhitelistedSwapTokensCard: React.FC<WhitelistedSwapTokensCardProps> = ({
  data,
  dataLoading,
  onUpdate,
  edit,
}) => {
  const { loading, setLoading } = useAppStore()
  const token = useToken()

  const [internalData, setInternalData] =
    useState<WhitelistedSwapTokensCardData[]>(data)
  const [addressInput, setAddressInput] = useState("")
  const [selectedTokenIdx, setSelectedTokenIdx] = useState(0)

  useEffect(() => {
    setInternalData(
      data.map((item) => {
        return {
          token: item.token,
          swapTokens: item.swapTokens || [],
        }
      })
    )
  }, [data])

  const add = async () => {
    try {
      if (addressInput === "") throw new Error("Address is required")

      setLoading(true)
      const tokenData = await validateTokenAddress()
      setLoading(false)

      const selectedToken = data[selectedTokenIdx]
      const swapTokens =
        internalData.find(
          (item) => item.token.address === selectedToken.token.address
        )?.swapTokens || []

      const newData = internalData.map((item) => {
        if (item.token.address === selectedToken.token.address) {
          return {
            ...item,
            swapTokens: [
              ...swapTokens,
              {
                address: addressInput,
                ...tokenData,
              },
            ],
          }
        }
        return item
      })

      setInternalData(newData)
      onUpdate(newData)
      setAddressInput("")
    } catch (error: any) {
      setLoading(false)
      errorToast(error.message)
    }
  }

  const remove = (tokenIndex: number, swapTokenIndex: number) => {
    const newData = internalData.map((item, outerIndex) => {
      if (outerIndex === tokenIndex) {
        return {
          token: item.token,
          swapTokens: item.swapTokens.filter((_, i) => i !== swapTokenIndex),
        }
      }
      return item
    })
    setInternalData(newData)
    onUpdate(newData)
  }

  const validateTokenAddress = async () => {
    if (data[selectedTokenIdx].token.address === addressInput) {
      throw new Error("Cannot add the same token as swap token")
    }
    if (
      internalData
        .find((i) => i.token.address === data[selectedTokenIdx].token.address)
        ?.swapTokens.find((i) => i.address === addressInput)
    ) {
      throw new Error("Token address already exists in the list")
    }
    return token.getTokenDetails(addressInput)
  }

  // CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
  // CBT5F2FSLHR4JERVHBIIQXQLONE4HZ5E4KC7W7NTR5NGPSH6KQ4AX4Y7
  // CBYSL2H7BJ43BWMYEMDPAAET3SF7QVRFVDDV3ODGKWDZGNPRHJICIQPQ
  // CBE6AVU4JNOJ2UGKQJ5F75377G4GEF4BDWMHD7OPU5C4HMIDCJ3L4AYL

  return (
    <Card>
      <div className="flex justify-between">
        <Text
          text="Diversifier Swap Tokens"
          size="14"
          lineHeight="16"
          letterSpacing="-1.5"
          color="#687B8C"
        />
        <div className="flex items-center gap-4">
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
        {!dataLoading && data.length === 0 && (
          <div className="flex w-full gap-3">
            <Image
              src="/icons/info.svg"
              height={12}
              width={12}
              alt="Info icon"
            />
            <Text
              text="This contract does not have any whitelisted tokens"
              size="12"
              color="#687B8C"
            />
          </div>
        )}
        {!dataLoading &&
          data.map((item, index) => {
            return (
              <div
                key={item.token.address}
                className="flex w-full flex-col gap-1 items-end"
              >
                <button
                  onClick={() => setSelectedTokenIdx(index)}
                  className="flex w-full"
                >
                  <div
                    className={clsx(
                      "h-[28px] w-full rounded-[8px] flex justify-between items-center px-1",
                      edit &&
                        "border-2 border-[#EBF2F7] p-4 px-2 hover:border-[#FFDC93] cursor-pointer",
                      selectedTokenIdx === index && "border-[#FFDC93]"
                    )}
                  >
                    <Text
                      text={`${index + 1}. ${item.token.name}`}
                      size="12"
                      lineHeight="12"
                      letterSpacing="-1.5"
                    />
                    <div className="flex items-center">
                      <div className="w-[65px] flex justify-end">
                        <Text
                          text={item.token.symbol}
                          size="12"
                          lineHeight="12"
                          letterSpacing="-1.5"
                        />
                      </div>
                      <div className="w-[75px] flex justify-end">
                        <Text
                          text={item.token.decimals.toString()}
                          size="12"
                          lineHeight="12"
                          letterSpacing="-1.5"
                        />
                      </div>
                    </div>
                  </div>
                </button>
                {internalData.find(
                  (i) => item.token.address === i.token.address
                )?.swapTokens?.length === 0 &&
                  !edit && (
                    <div className="flex w-full gap-1 pl-4">
                      <Image
                        src="/icons/info.svg"
                        height={12}
                        width={12}
                        alt="Info icon"
                      />
                      <Text
                        text="No swap tokens for found this token"
                        size="12"
                        color="#687B8C"
                      />
                    </div>
                  )}
                {internalData
                  .find((i) => item.token.address === i.token.address)
                  ?.swapTokens.map((swapToken, swapIndex) => {
                    return (
                      <div
                        key={swapToken.address}
                        className="flex w-full items-center pl-4"
                      >
                        <div
                          className={clsx(
                            "h-[28px] w-full rounded-[8px] flex justify-between items-center px-1",
                            edit && "border-2 border-[#EBF2F7] p-4 px-2"
                          )}
                        >
                          <Text
                            text={`${swapIndex + 1}. ${swapToken.name}`}
                            size="12"
                            lineHeight="12"
                            letterSpacing="-1.5"
                          />
                          <div className="flex items-center">
                            <div className="w-[65px] flex justify-end">
                              <Text
                                text={swapToken.symbol}
                                size="12"
                                lineHeight="12"
                                letterSpacing="-1.5"
                              />
                            </div>
                            <div className="w-[75px] flex justify-end">
                              <Text
                                text={swapToken.decimals.toString()}
                                size="12"
                                lineHeight="12"
                                letterSpacing="-1.5"
                              />
                            </div>
                          </div>
                        </div>
                        {edit && (
                          <button onClick={() => remove(index, swapIndex)}>
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
                {selectedTokenIdx === index && edit && (
                  <div className="flex w-full items-center pl-4">
                    <Image
                      src="/icons/wrench.svg"
                      width="12"
                      height="12"
                      alt="Trash icon"
                      className="mr-2 h-[28px]"
                    />
                    <AddressInput
                      placeholder="Enter token address"
                      onChange={(e) => setAddressInput(e.target.value)}
                      value={addressInput}
                      disabled={loading}
                    />
                  </div>
                )}
              </div>
            )
          })}
      </div>
      {edit && data.length !== 0 && (
        <div className="flex flex-col items-center gap-1 mt-1">
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
                    text="Add whitelisted swap token"
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

export default WhitelistedSwapTokensCard
