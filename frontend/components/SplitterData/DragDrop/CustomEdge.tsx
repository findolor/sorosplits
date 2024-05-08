import ShareInput from "@/components/Input/Share"
import Image from "next/image"
import React, { useCallback } from "react"
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useReactFlow,
  useStore,
} from "reactflow"

import { getEdgeParams } from "./utils"

function EdgeFunction({
  value,
  valueOnChange,
  removeEdge,
}: {
  value: string
  valueOnChange: (value: string) => void
  removeEdge: () => void
}) {
  return (
    <div className="flex gap-2 items-center">
      <ShareInput
        value={value}
        onChange={valueOnChange}
        className="border-black"
      />
      <button onClick={removeEdge}>
        <Image src="/icons/trash.svg" alt="trash" width={12} height={12} />
      </button>
    </div>
  )
}

export default function CustomEdge({
  id,
  source,
  target,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const { getEdges, setEdges } = useReactFlow()
  const sourceNode = useStore(
    useCallback((store) => store.nodeInternals.get(source), [source])
  )
  const targetNode = useStore(
    useCallback((store) => store.nodeInternals.get(target), [target])
  )
  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode
  )

  if (!sourceNode || !targetNode) {
    return null
  }

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  })

  const removeEdge = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id))
  }

  const edgeValueOnChange = (value: string) => {
    const edges = getEdges()
    const edge = edges.find((edge) => edge.id === id)
    if (!edge) {
      return
    }
    edge.data.share = value
    setEdges(edges)
  }

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <EdgeFunction
            valueOnChange={edgeValueOnChange}
            value={data.share}
            removeEdge={removeEdge}
          />
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
