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
import useModal from "@/hooks/modals/useBalanceActions"
import { Action } from "../Modal/BalanceActions"
import parseContractError from "@/utils/parseContractError"
import useDiversifier from "@/hooks/contracts/useDiversifier"

interface TokenBalancesCardProps {
  data: WhitelistedTokensCardData[]
  isDiversifierActive: boolean
  isUserAdmin: boolean
  diversifierContractAddress: string
  splitterContractAddress: string
}

const TokenBalancesCard: React.FC<TokenBalancesCardProps> = ({
  data,
  isDiversifierActive,
  isUserAdmin,
  diversifierContractAddress,
  splitterContractAddress,
}) => {
  const token = useToken()
  const splitter = useSplitter()
  const diversifier = useDiversifier()
  const { walletAddress, setLoading, isConnected, loading } = useAppStore()
  const { RenderModal, toggleModal } = useModal()

  const [allocation, setAllocation] = useState<BigInt[]>([])
  const [waitingForDistribution, setWaitingForDistribution] = useState<
    BigInt[]
  >([])
  const [selectedToken, setSelectedToken] = useState<null | number>(null)

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

  const handleWithdrawAllocation = async (index: number, amount: number) => {
    loadingToast("Withdrawal in progress...")

    const withdrawAmount = amount * 10 ** data[index].decimals
    if (withdrawAmount > Number(allocation[index])) {
      throw new Error(
        "Amount to withdraw is greater than the available allocation."
      )
    }

    await splitter.call.withdrawAllocation(
      diversifierContractAddress,
      data[index].address,
      walletAddress || "",
      withdrawAmount
    )

    successToast("Withdrawal successful!")
  }

  const handleTransferTokens = async (
    index: number,
    recipient: string,
    amount: number
  ) => {
    loadingToast("Transfer in progress...")

    const transferAmount = amount * 10 ** data[index].decimals
    if (transferAmount > Number(waitingForDistribution[index])) {
      throw new Error(
        "Amount to transfer is greater than the available balance."
      )
    }

    await splitter.call.transferTokens(
      diversifierContractAddress,
      data[index].address,
      recipient,
      transferAmount
    )

    successToast("Transfer successful!")
  }

  const handleDistributeTokens = async (index: number, amount: number) => {
    loadingToast("Distribution in progress...")

    const distributeAmount = amount * 10 ** data[index].decimals
    if (distributeAmount > Number(waitingForDistribution[index])) {
      throw new Error(
        "Amount to distribute is greater than the available balance."
      )
    }

    await splitter.call.distributeTokens(
      diversifierContractAddress,
      data[index].address,
      distributeAmount
    )

    successToast("Distribution successful!")
  }

  const handleSwapAndDistributeTokens = async (
    index: number,
    amount: number
  ) => {
    loadingToast("Distribution in progress...")

    const distributeAmount = amount * 10 ** data[index].decimals
    if (distributeAmount > Number(waitingForDistribution[index])) {
      throw new Error(
        "Amount to distribute is greater than the available balance."
      )
    }

    // TODO: FIX THIS
    await diversifier.call.swapAndDistributeTokens(
      diversifierContractAddress,
      "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
      "CBT5F2FSLHR4JERVHBIIQXQLONE4HZ5E4KC7W7NTR5NGPSH6KQ4AX4Y7",
      distributeAmount
    )

    successToast("Distribution successful!")
  }

  const tokenActionOnConfirm = async (
    action: Action,
    data: Record<string, any>
  ) => {
    try {
      setLoading(true)

      if (!isConnected) throw new Error("Please connect your wallet.")

      if (selectedToken === null) throw new Error("No token selected.")

      console.log(action, data)

      switch (action) {
        case "withdraw_allocation":
          await handleWithdrawAllocation(selectedToken, data.amount)
          break
        case "swap_and_distribute_tokens":
          await handleSwapAndDistributeTokens(selectedToken, data.amount)
          break
        case "distribute_tokens":
          await handleDistributeTokens(selectedToken, data.amount)
          break
        case "transfer_tokens":
          await handleTransferTokens(selectedToken, data.recipient, data.amount)
          break
      }

      await fetchBalanceData()
    } catch (error) {
      setLoading(false)
      errorToast(parseContractError(error))
    }
  }

  return (
    <Card>
      <div className="flex justify-between">
        <Text
          text="Balances"
          size="14"
          lineHeight="16"
          letterSpacing="-1.5"
          color="#687B8C"
        />
        <div className="flex items-center gap-8 pr-14">
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
            text="For Distribution"
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
                <div className="flex justify-end">
                  <Text
                    text={floorToFixed(
                      getBalance(allocation[index] || BigInt(0), item.decimals),
                      2
                    )}
                    size="12"
                    lineHeight="12"
                    letterSpacing="-1.5"
                  />
                </div>
                <div className="w-[135px] flex justify-end">
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
                </div>
                <button
                  className={clsx(
                    "ml-[25px] px-2 py-1 bg-[#FFDC93] rounded-md hover:bg-[#FFD166]",
                    loading && "opacity-50"
                  )}
                  onClick={() => {
                    setSelectedToken(index)
                    toggleModal(true)
                  }}
                  disabled={loading}
                >
                  <Image
                    src="/icons/transfer.svg"
                    height={16}
                    width={16}
                    alt="Transfer icon"
                  />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <RenderModal
        title="Token Actions"
        message={`Execute the following actions on ${
          data.length > 0 && selectedToken !== null
            ? data[selectedToken].name
            : ""
        }.`}
        onConfirm={tokenActionOnConfirm}
        isAdmin={isUserAdmin}
        isDiversifierActive={isDiversifierActive}
        maxAmounts={{
          allocation:
            selectedToken !== null && data.length > 0
              ? getBalance(
                  allocation[selectedToken],
                  data[selectedToken].decimals
                )
              : 0,
          unused:
            selectedToken !== null && data.length > 0
              ? getBalance(
                  waitingForDistribution[selectedToken],
                  data[selectedToken].decimals
                )
              : 0,
        }}
      />
    </Card>
  )
}

export default TokenBalancesCard
