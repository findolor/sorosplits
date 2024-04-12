import { Handle, Position } from "reactflow"
import Text from "../../Text"
import { ShareholderCardData } from "../Shareholders"

interface CustomNodeProps {
  data: {
    contractInfo: {
      name: string
      updatable: boolean
    }
    shareholders: ShareholderCardData[]
    updatable: boolean
    selected: boolean
  }
}

const CustomNode = ({
  data: {
    contractInfo: { name, updatable },
    shareholders,
    selected,
  },
}: CustomNodeProps) => {
  return (
    <div
      className={`h-20 w-60 border ${
        selected ? "border-red-300" : "border-[#C3D1DD]"
      } bg-white rounded-lg`}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} id="a" />

      <div className="w-full h-full flex flex-col items-center pt-4">
        <Text text={name} size="16" lineHeight="24" letterSpacing="-2" />
        <Text
          text={updatable ? "UNLOCKED" : "LOCKED"}
          size="16"
          lineHeight="24"
          letterSpacing="-2"
        />
      </div>
    </div>
  )
}

export default CustomNode
