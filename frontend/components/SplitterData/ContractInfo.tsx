import { truncateAddressLong } from "@/utils/truncateAddress"
import Image from "next/image"
import Text from "../Text"
import useAppStore from "@/store/index"
import Card from "./Card"
import Switch from "../Switch"
import { useState } from "react"

interface ContractInfoCardProps {
  data: {
    owner: string
    name: string
    updatable: boolean
    balances: {
      tokenName: string
      tokenAmount: string
      tokenSymbol: string
    }[]
    totalDistributions: {
      tokenName: string
      tokenAmount: string
      tokenSymbol: string
    }[]
  }
  edit: boolean
}

const ContractInfoCard: React.FC<ContractInfoCardProps> = ({ data, edit }) => {
  const { walletAddress } = useAppStore()

  const [name, setName] = useState(data.name)
  const [updatable, setUpdatable] = useState(data.updatable)

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

  const RenderSection = ({ children }: { children: React.ReactNode }) => {
    return <div className="flex flex-col pl-2 mb-3">{children}</div>
  }

  const RenderRow = ({
    leftText,
    rightText,
  }: {
    leftText: string
    rightText: string
  }) => {
    return (
      <div className="flex justify-between mb-3">
        <Text
          text={leftText}
          size="12"
          lineHeight="12"
          letterSpacing="-1.5%"
          color="#323C45"
        />
        <Text
          text={rightText}
          size="12"
          lineHeight="12"
          letterSpacing="-1.5%"
          color="#323C45"
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
    return (
      <div className="flex justify-between mb-2">
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

  return (
    <Card width="423">
      <RenderHeader value="Contract info" />
      <RenderSection>
        <RenderRowWithAddress leftText="Owner" rightText={data.owner} />
        <RenderRow leftText="Name" rightText={data.name} />
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
            {edit && (
              <div className="ml-2">
                <Switch
                  initialState={updatable}
                  onChange={setUpdatable}
                  locked={false}
                />
              </div>
            )}
          </div>
        </div>
      </RenderSection>
      <RenderHeader value="Balances" />
      <RenderSection>
        {data.balances.length === 0 && (
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
        {data.balances.length > 0 &&
          data.balances.map((balance, idx) => {
            return (
              <RenderRow
                key={idx.toString()}
                leftText={balance.tokenName}
                rightText={`${balance.tokenAmount} ${balance.tokenSymbol}`}
              />
            )
          })}
      </RenderSection>
      <RenderHeader value="Total distributions" />
      <RenderSection>
        {data.balances.length === 0 && (
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
        {data.totalDistributions.map((distribution, idx) => (
          <RenderRow
            key={idx}
            leftText={distribution.tokenName}
            rightText={`${distribution.tokenAmount} ${distribution.tokenSymbol}`}
          />
        ))}
      </RenderSection>
    </Card>
  )
}

export default ContractInfoCard
