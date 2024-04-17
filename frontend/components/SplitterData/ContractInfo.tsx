import { truncateAddressLong } from "@/utils/truncateAddress"
import Image from "next/image"
import Text from "../Text"
import useAppStore from "@/store/index"
import Card from "./Card"
import Switch from "../Switch"
import { useEffect, useState } from "react"
import AddressInput from "../Input/Address"
import useSplitter from "@/hooks/contracts/useSplitter"
import { WhitelistedTokensCardData } from "./WhitelistedTokens"

export interface TokenBalanceData {
  tokenData: WhitelistedTokensCardData
  amount: string
}

interface ContractInfoCardProps {
  data: {
    owner: string
    name: string
    updatable: boolean
    isDiversifierActive: boolean
  }
  onUpdate: (name: string, updatable: boolean, diversifier: boolean) => void
  edit: boolean
  reset: number
  create?: boolean
}

const ContractInfoCard: React.FC<ContractInfoCardProps> = ({
  data,
  onUpdate,
  edit,
  reset,
  create,
}) => {
  const { loading, walletAddress } = useAppStore()
  const splitter = useSplitter()

  const [contractName, setContratName] = useState(data.name)
  const [updatable, setUpdatable] = useState(data.updatable)
  const [isDiversifierActive, setIsDiversifierActive] = useState(
    data.isDiversifierActive
  )

  useEffect(() => {
    setContratName(data.name)
    setUpdatable(data.updatable)
  }, [reset])

  const diversifierOnChange = () => {
    setIsDiversifierActive(!isDiversifierActive)
    onUpdate(contractName, !updatable, !isDiversifierActive)
  }

  const updatableOnChange = () => {
    setUpdatable(!updatable)
    onUpdate(contractName, !updatable, isDiversifierActive)
  }

  const nameOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContratName(e.target.value)
    onUpdate(e.target.value, updatable, isDiversifierActive)
  }

  return (
    <Card>
      <RenderHeader value="Contract info" />
      <div className="flex flex-col pl-2">
        <RenderRowWithAddress leftText="Owner" rightText={data.owner} />
        <div className="flex justify-between mb-4 items-center">
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
        <div className="flex items-center gap-1 mb-1">
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
                  onChange={updatableOnChange}
                  locked={loading}
                  reset={reset}
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Image src="/icons/info.svg" height={12} width={12} alt="Info icon" />
          <div className="flex items-center">
            <Text text="Diversifier is" size="12" color="#687B8C" />
            &nbsp;
            <Text
              text={isDiversifierActive ? "enabled" : "disabled"}
              size="12"
              color="#687B8C"
              bold
            />
            {(data.isDiversifierActive || create) && edit && (
              <div className="ml-2">
                <Switch
                  initialState={isDiversifierActive}
                  onChange={diversifierOnChange}
                  locked={loading}
                  reset={reset}
                />
              </div>
            )}
          </div>
        </div>
      </div>
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
