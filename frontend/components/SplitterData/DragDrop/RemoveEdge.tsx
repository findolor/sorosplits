import Text from "@/components/Text"
import React from "react"
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useReactFlow,
} from "reactflow"

function EdgeLabel({ transform, label }: { transform: string; label: string }) {
  return (
    <div
      style={{
        transform,
      }}
      className="nodrag nopan absolute bg-white p-2 rounded-lg border border-black w-[100px] flex justify-center"
    >
      <Text text={label} size="12" lineHeight="12" letterSpacing="-1.5" />
    </div>
  )
}

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const { setEdges } = useReactFlow()
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id))
  }

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        {data.startLabel && (
          <EdgeLabel
            transform={`translate(-50%, 20%) translate(${sourceX}px,${sourceY}px)`}
            label={data.startLabel}
          />
        )}
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <button
            className="flex items-center justify-center bg-white p-2 border border-black rounded-lg hover:bg-black hover:text-white"
            onClick={onEdgeClick}
          >
            Remove connection
          </button>
        </div>
        {data.endLabel && (
          <EdgeLabel
            transform={`translate(-50%, -140%) translate(${targetX}px,${targetY}px)`}
            label={data.endLabel}
          />
        )}
      </EdgeLabelRenderer>
    </>
  )
}
