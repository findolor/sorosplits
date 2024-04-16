import { Handle, Position, useReactFlow } from "reactflow"
import Text from "../../Text"
import { ShareholderCardData } from "../Shareholders"
import { WhitelistedTokensCardData } from "../WhitelistedTokens"
import Image from "next/image"
import { useMemo } from "react"

export interface NodeData {
  contractInfo: {
    name: string
    updatable: boolean
  }
  shareholders: ShareholderCardData[]
  whitelistedTokens: WhitelistedTokensCardData[]
  selected: boolean
}

const CustomNode = ({
  id,
  data: {
    contractInfo: { name },
    shareholders,
    whitelistedTokens,
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

  const splitterShareholders = useMemo(() => {
    return edges.filter((edge) => edge.target === id)
  }, [edges])

  return (
    <div
      className={`h-20 w-60 border ${
        selected ? "border-[#FF9E9E] border-2" : "border-[#C3D1DD]"
      } bg-white rounded-xl`}
    >
      <Handle type="source" position={Position.Top} id="a" />
      <Handle type="source" position={Position.Right} id="b" />
      <Handle type="source" position={Position.Bottom} id="c" />
      <Handle type="source" position={Position.Left} id="d" />

      <div className="w-full h-full flex flex-col items-center pt-4 relative">
        <button
          className="absolute top-[-10px] right-[-4px]"
          onClick={removeNode}
        >
          <div className="flex items-center justify-center bg-white h-[20px]">
            <Image src="/icons/trash.svg" alt="trash" width={16} height={16} />
          </div>
        </button>
        <Text text={name} size="16" lineHeight="12" letterSpacing="-2" />
        <div className="flex flex-col mt-2">
          <Text
            text={`${shareholders.length} shareholders (users)`}
            size="10"
            color="#687B8C"
          />
          <Text
            text={`${splitterShareholders.length} shareholders (contracts)`}
            size="10"
            color="#687B8C"
          />
        </div>
      </div>
    </div>
  )
}

export default CustomNode
