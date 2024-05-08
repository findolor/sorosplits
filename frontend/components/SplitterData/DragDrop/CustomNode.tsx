import { Handle, Position, useReactFlow } from "reactflow"
import Text from "../../Text"
import { ShareholderCardData } from "../Shareholders"
import { WhitelistedTokensCardData } from "../WhitelistedTokens"
import Image from "next/image"
import { useMemo } from "react"
import { WhitelistedSwapTokensCardData } from "../WhitelistedSwapTokens"

export interface NodeData {
  contractInfo: {
    name: string
    updatable: boolean
    isDiversifierActive: boolean
  }
  shareholders: ShareholderCardData[]
  whitelistedTokens: WhitelistedTokensCardData[]
  whitelistedSwapTokens: WhitelistedSwapTokensCardData[]
  selected: boolean
}

const CustomNode = ({
  id,
  data: {
    contractInfo: { name, isDiversifierActive },
    shareholders,
    selected,
  },
}: {
  id: string
  data: NodeData
}) => {
  const { setNodes, setEdges, getEdges } = useReactFlow()
  const edges = getEdges()

  const removeNode = () => {
    setEdges((prevEdges) => {
      return prevEdges.filter(
        (edge) => edge.source !== id && edge.target !== id
      )
    })
    setNodes((prevNodes) => {
      return prevNodes.filter((node) => node.id !== id)
    })
  }

  const connectedEdges = useMemo(() => {
    return edges.filter((edge) => edge.source === id)
  }, [edges])

  const totalShareholderShares = useMemo(() => {
    let totalShares = 0
    for (const shareholder of shareholders) {
      totalShares += parseInt(shareholder.share)
    }
    return totalShares
  }, [shareholders])

  const totalOutputContractShares = useMemo(() => {
    let totalShares = 0
    for (const edge of connectedEdges) {
      totalShares += parseInt(edge.data.share || 0)
    }
    return totalShares
  }, [connectedEdges])

  return (
    <div
      className={`h-[90px] w-60 border-2 ${
        selected ? "border-[#FFDC93]" : "border-[#C3D1DD]"
      } bg-white rounded-xl hover:border-[#FFDC93]`}
    >
      <Handle type="source" position={Position.Top} id="a" />
      <Handle type="source" position={Position.Right} id="b" />
      <Handle type="source" position={Position.Bottom} id="c" />
      <Handle type="source" position={Position.Left} id="d" />

      <div className="w-full h-full flex flex-col items-center pt-3 relative">
        <button
          className="absolute top-[-10px] right-[-4px] bg-red-500"
          onClick={removeNode}
        >
          <div className="flex items-center justify-center bg-white h-[20px]">
            <Image src="/icons/trash.svg" alt="trash" width={16} height={16} />
          </div>
        </button>
        <Text text={name} size="16" lineHeight="12" letterSpacing="-2" />
        <div className="flex flex-col pt-1 items-center gap-1 w-full px-8">
          <div>
            <Text
              text={`Diversifier ${
                isDiversifierActive ? "enabled" : "disabled"
              }`}
              size="8"
              color="#687B8C"
              lineHeight="12"
            />
            <Text
              text={`${
                totalShareholderShares + totalOutputContractShares
              }% share total`}
              size="8"
              color={
                totalShareholderShares + totalOutputContractShares > 100
                  ? "red"
                  : "#687B8C"
              }
              lineHeight="12"
              centered
              bold={totalShareholderShares + totalOutputContractShares > 100}
            />
          </div>
          <div className="flex justify-between w-full">
            <div>
              <Text
                text={`${shareholders.length} user share`}
                size="10"
                color="black"
                lineHeight="12"
                bold
                centered
              />
              <Text
                text={`${totalShareholderShares}% share total`}
                size="8"
                color="#687B8C"
                lineHeight="12"
                centered
              />
            </div>
            <div>
              <Text
                text={`${connectedEdges.length} contract share`}
                size="10"
                color="black"
                lineHeight="12"
                bold
                centered
              />
              <Text
                text={`${totalOutputContractShares}% share total`}
                size="8"
                color="#687B8C"
                lineHeight="12"
                centered
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomNode
