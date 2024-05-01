import Image from "next/image"
import Text from "../Text"
import Card from "./Card"
import clsx from "clsx"
import { useEffect, useState } from "react"
import useToken from "@/hooks/contracts/useToken"
import { WhitelistedTokensCardData } from "./WhitelistedTokens"
import { floorToFixed, getBalance } from "@/utils/getBalance"
import useSplitter from "@/hooks/contracts/useSplitter"
import useAppStore from "@/store/index"
import { errorToast, loadingToast, successToast } from "@/utils/toast"

interface TokenBalancesCardProps {
  data: WhitelistedTokensCardData[]
  isDiversifierActive: boolean
  diversifierContractAddress: string
  splitterContractAddress: string
}

const TokenBalancesCard: React.FC<TokenBalancesCardProps> = ({
  data,
  isDiversifierActive,
  diversifierContractAddress,
  splitterContractAddress,
}) => {
  const token = useToken()
  const splitter = useSplitter()
  const { walletAddress, setLoading, isConnected, loading } = useAppStore()

  const [isDistributionHovered, setIsDistributionHovered] = useState<
    [number, boolean]
  >([0, false])
  const [isWithdrawHovered, setIsWithdrawHovered] = useState<[number, boolean]>(
    [0, false]
  )

  const [allocation, setAllocation] = useState<BigInt[]>([])
  const [waitingForDistribution, setWaitingForDistribution] = useState<
    BigInt[]
  >([])

  useEffect(() => {
    if (data.length === 0) return

    fetchBalanceData()
  }, [data, diversifierContractAddress, walletAddress])

  const fetchBalanceData = async () => {
    setLoading(true)

    const allocationRes = walletAddress
      ? await Promise.all(
          data.map((item) => {
            return splitter.query.getAllocation(
              splitterContractAddress,
              item.address,
              walletAddress
            )
          })
        )
      : data.map(() => BigInt(0))

    setAllocation(allocationRes)

    const diversifierTotalRes = await Promise.all(
      data.map((item) => {
        return token.query.getBalance(item.address, diversifierContractAddress)
      })
    )

    if (isDiversifierActive) {
      setWaitingForDistribution(diversifierTotalRes)
    } else {
      const unusedRes = await Promise.all(
        data.map((item) => {
          return splitter.query.getUnusedTokens(
            splitterContractAddress,
            item.address
          )
        })
      )
      let total = []
      for (let i = 0; i < data.length; i++) {
        total.push(Number(diversifierTotalRes[i]) + Number(unusedRes[i]))
      }
      setWaitingForDistribution(total.map((item, index) => BigInt(item)))
    }

    setLoading(false)
  }

  const handleWithdrawAllocation = async (index: number) => {
    try {
      setLoading(true)

      if (!isConnected) throw new Error("Please connect your wallet.")

      loadingToast("Withdrawal in progress...")

      console.log(Number(allocation[index]) * 10 ** data[index].decimals)

      await splitter.call.withdrawAllocation(
        diversifierContractAddress,
        data[index].address,
        walletAddress || "",
        Number(allocation[index])
      )

      successToast("Withdrawal successful!")

      await fetchBalanceData()
    } catch (error: any) {
      setLoading(false)
      errorToast(error)
    }
  }

  const handleTransferTokens = async (index: number) => {
    try {
      setLoading(true)

      if (!isConnected) throw new Error("Please connect your wallet.")

      loadingToast("Transfer in progress...")

      await splitter.call.transferTokens(
        diversifierContractAddress,
        data[index].address,
        walletAddress || "",
        Number(waitingForDistribution[index])
      )

      successToast("Transfer successful!")

      await fetchBalanceData()
    } catch (error: any) {
      setLoading(false)
      errorToast(error)
    }
  }

  const handleDistributeTokens = async (index: number) => {
    try {
      setLoading(true)

      if (!isConnected) throw new Error("Please connect your wallet.")

      loadingToast("Distribution in progress...")

      await splitter.call.distributeTokens(
        diversifierContractAddress,
        data[index].address,
        Number(waitingForDistribution[index])
      )

      successToast("Distribution successful!")

      await fetchBalanceData()
    } catch (error: any) {
      setLoading(false)
      errorToast(error)
    }
  }

  return (
    <Card>
      <div className="flex justify-between">
        <Text
          text="Token Balances"
          size="14"
          lineHeight="16"
          letterSpacing="-1.5"
          color="#687B8C"
        />
        <div className="flex items-center gap-8">
          <Text
            text="My Allocation"
            size="14"
            lineHeight="16"
            letterSpacing="-1.5"
            color="#687B8C"
          />
          {/* <Text
            text="Unallocated"
            size="14"
            lineHeight="16"
            letterSpacing="-1.5"
            color="#687B8C"
          /> */}
          <Text
            text="Waiting for Distribution"
            size="14"
            lineHeight="16"
            letterSpacing="-1.5"
            color="#687B8C"
          />
        </div>
      </div>

      <div className="flex flex-col mt-3 gap-1">
        {data.length === 0 && (
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
        {data.map((item, index) => {
          return (
            <div
              key={item.address}
              className={clsx(
                "h-[28px] w-full rounded-[8px] flex justify-between items-center px-1"
              )}
            >
              <Text
                text={item.name}
                size="12"
                lineHeight="12"
                letterSpacing="-1.5"
              />
              <div className="flex items-center">
                {/* <div className="w-[110px] flex justify-end">
                  <Text
                    text={unused[index]}
                    size="12"
                    lineHeight="12"
                    letterSpacing="-1.5"
                  />
                </div> */}
                {/* <div className="w-[65px] flex justify-end"> */}
                <div
                  className="w-[150px] ml-[35px] flex justify-end"
                  onMouseEnter={() => setIsWithdrawHovered([index, true])}
                  onMouseLeave={() => setIsWithdrawHovered([index, false])}
                >
                  {isWithdrawHovered[0] === index && isWithdrawHovered[1] ? (
                    <button
                      className={clsx(
                        "p-2 px-4 bg-[#FFDC93] rounded-md",
                        loading && "opacity-50"
                      )}
                      onClick={() => handleWithdrawAllocation(index)}
                      disabled={loading}
                    >
                      <Text
                        text="Withdraw"
                        size="12"
                        lineHeight="12"
                        letterSpacing="-1.5"
                        bold
                      />
                    </button>
                  ) : (
                    <Text
                      text={floorToFixed(
                        getBalance(
                          allocation[index] || BigInt(0),
                          item.decimals
                        ),
                        2
                      )}
                      size="12"
                      lineHeight="12"
                      letterSpacing="-1.5"
                    />
                  )}
                </div>
                <div
                  className="w-[150px] ml-[35px] flex justify-end"
                  onMouseEnter={() => setIsDistributionHovered([index, true])}
                  onMouseLeave={() => setIsDistributionHovered([index, false])}
                >
                  {isDistributionHovered[0] === index &&
                  isDistributionHovered[1] ? (
                    <button
                      className={clsx(
                        "p-2 px-4 bg-[#FFDC93] rounded-md",
                        loading && "opacity-50"
                      )}
                      onClick={() => handleDistributeTokens(index)}
                      disabled={loading}
                    >
                      <Text
                        text="Distribute"
                        size="12"
                        lineHeight="12"
                        letterSpacing="-1.5"
                        bold
                      />
                    </button>
                  ) : (
                    <Text
                      text={floorToFixed(
                        getBalance(
                          waitingForDistribution[index] || BigInt(0),
                          item.decimals
                        ),
                        2
                      )}
                      size="12"
                      lineHeight="12"
                      letterSpacing="-1.5"
                    />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default TokenBalancesCard
