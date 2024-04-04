import { truncateAddressLong } from "@/utils/truncateAddress"
import Image from "next/image"
import Text from "../Text"
import useAppStore from "@/store/index"
import Card from "./Card"
import Switch from "../Switch"
import { useEffect, useState } from "react"
import AddressInput from "../Input/Address"
import { DistributeTokensButton } from "../Button/Splitter"
import useSplitter from "@/hooks/useSplitter"
import { WhitelistedTokensCardData } from "./WhitelistedTokens"
import Loading from "../Loading"

export interface TokenBalanceData {
  tokenData: WhitelistedTokensCardData
  amount: string
}

interface ContractInfoCardProps {
  data: {
    owner: string
    name: string
    updatable: boolean
  }
  balanceData: TokenBalanceData[]
  balanceDataLoading?: boolean
  totalDistributionsData: TokenBalanceData[]
  onUpdate: (name: string, updatable: boolean) => void
  edit: boolean
  reset: number
  create?: boolean
}

const ContractInfoCard: React.FC<ContractInfoCardProps> = ({
  data,
  balanceData,
  balanceDataLoading,
  totalDistributionsData,
  onUpdate,
  edit,
  reset,
  create,
}) => {
  const { loading, walletAddress } = useAppStore()
  const splitter = useSplitter()

  const [contractName, setContratName] = useState(data.name)
  const [updatable, setUpdatable] = useState(data.updatable)

  useEffect(() => {
    setContratName(data.name)
    setUpdatable(data.updatable)
  }, [reset])

  const switchOnChange = () => {
    setUpdatable(!updatable)
    onUpdate(contractName, !updatable)
  }

  const nameOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContratName(e.target.value)
    onUpdate(e.target.value, updatable)
  }

  return (
    <Card width="423">
      <RenderHeader value="Contract info" />
      <div className="flex flex-col pl-2 mb-3">
        <RenderRowWithAddress leftText="Owner" rightText={data.owner} />
        <div className="flex justify-between mb-3 items-center">
          <Text
            text="Name"
            size="12"
            lineHeight="12"
            letterSpacing="-1.5%"
            color="#323C45"
          />
          {edit ? (
            <div className="flex w-full ml-8">
              <AddressInput
                placeholder="Enter contract name"
                value={contractName}
                onChange={nameOnChange}
                alignRight
                disabled={loading}
              />
            </div>
          ) : (
            <Text
              text={contractName}
              size="12"
              lineHeight="12"
              letterSpacing="-1.5%"
              color="#323C45"
            />
          )}
        </div>
        <div className="flex items-center gap-1">
          <Image src="/icons/info.svg" height={12} width={12} alt="Info icon" />
          <div className="flex items-center">
            <Text text="Shareholders & shares are" size="12" color="#687B8C" />
            &nbsp;
            <Text
              text={updatable ? "updatable" : "locked"}
              size="12"
              color="#687B8C"
              bold
            />
            {(data.updatable || create) && edit && (
              <div className="ml-2">
                <Switch
                  initialState={updatable}
                  onChange={switchOnChange}
                  locked={loading}
                  reset={reset}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {!edit && (
        <>
          <RenderHeader value="Balances" />
          <div className="flex flex-col pl-2 mb-3">
            {balanceDataLoading && <Loading small />}
            {!balanceDataLoading && balanceData.length === 0 && (
              <div className="flex gap-1">
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
            {!balanceDataLoading &&
              balanceData.length > 0 &&
              balanceData.map((item, idx) => {
                return (
                  <div
                    key={idx.toString()}
                    className="w-full flex items-center justify-between mb-2"
                  >
                    <Text
                      text={item.tokenData.name}
                      size="12"
                      lineHeight="12"
                      letterSpacing="-1.5%"
                      color="#323C45"
                    />
                    <div className="flex items-center gap-3">
                      <Text
                        text={`${item.amount} ${item.tokenData.symbol}`}
                        size="12"
                        lineHeight="12"
                        letterSpacing="-1.5%"
                        color="#323C45"
                      />
                      {data.owner === walletAddress &&
                        item.amount != "0.00" && (
                          <DistributeTokensButton onClick={() => {}} />
                        )}
                    </div>
                  </div>
                )
              })}
          </div>
          <RenderHeader value="Total distributions" />
          <div className="flex flex-col pl-2 mb-3">
            {totalDistributionsData.length === 0 && (
              <div className="flex gap-1">
                <Image
                  src="/icons/info.svg"
                  height={12}
                  width={12}
                  alt="Info icon"
                />
                <Text
                  text="This contract does not have any distributions"
                  size="12"
                  color="#687B8C"
                />
              </div>
            )}
            {totalDistributionsData.length > 0 &&
              totalDistributionsData.map((item, idx) => (
                <div
                  key={idx.toString()}
                  className="w-full flex items-center justify-between mb-2"
                >
                  <Text
                    text={item.tokenData.name}
                    size="12"
                    lineHeight="12"
                    letterSpacing="-1.5%"
                    color="#323C45"
                  />
                  <Text
                    text={`${item.amount} ${item.tokenData.symbol}`}
                    size="12"
                    lineHeight="12"
                    letterSpacing="-1.5%"
                    color="#323C45"
                  />
                </div>
              ))}
          </div>
        </>
      )}
    </Card>
  )
}

const RenderHeader = ({ value }: { value: string }) => {
  return (
    <div className="mb-3">
      <Text
        text={value}
        size="14"
        lineHeight="16"
        letterSpacing="-1.5"
        color="#687B8C"
      />
    </div>
  )
}

const RenderRowWithAddress = ({
  leftText,
  rightText,
}: {
  leftText: string
  rightText: string
}) => {
  const { walletAddress } = useAppStore()

  return (
    <div className="flex justify-between mb-2 items-center">
      <Text
        text={leftText}
        size="12"
        lineHeight="12"
        letterSpacing="-1.5%"
        color="#323C45"
      />
      <Text
        text={
          walletAddress === rightText ? "You" : truncateAddressLong(rightText)
        }
        size="12"
        lineHeight="12"
        letterSpacing="-1.5%"
        color="#323C45"
      />
    </div>
  )
}

export default ContractInfoCard
