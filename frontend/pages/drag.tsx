import PageHeader from "@/components/PageHeader"
import ContractInfoCard from "@/components/SplitterData/ContractInfo"
import React, { useCallback, useState } from "react"
import ReactFlow, {
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Edge,
  Connection,
  Controls,
  MarkerType,
  Node,
} from "reactflow"
import "reactflow/dist/style.css"
import CustomNode from "@/components/SplitterData/DragDrop/CustomNode"
import CustomEdge from "@/components/SplitterData/DragDrop/RemoveEdge"
import Layout from "@/components/Layout"
import WhitelistedTokensCard, {
  WhitelistedTokensCardData,
} from "@/components/SplitterData/WhitelistedTokens"
import ShareholdersCard, {
  ShareholderCardData,
} from "@/components/SplitterData/Shareholders"
import Card from "@/components/SplitterData/Card"

interface NodeData {
  contractInfo: {
    name: string
    updatable: boolean
  }
  shareholders: ShareholderCardData[]
  whitelistedTokens: WhitelistedTokensCardData[]
}

const nodeTypes = {
  customNode: CustomNode,
}
const initialNodes = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    type: "customNode",
    data: { name: "Splitter 1", updatable: true, selected: true },
  },
  {
    id: "2",
    position: { x: 0, y: 200 },
    type: "customNode",
    data: { name: "Splitter 2", updatable: true, selected: true },
  },
]

const edgeTypes = {
  customEdge: CustomEdge,
}

export default function DragDrop() {
  const [resetTrigger, setResetTrigger] = useState(0)
  const [selectedNodeIdx, setSelectedNodeIdx] = useState(0)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    {
      id: `e1-2`,
      source: "1",
      target: "2",
      animated: true,
      type: "customEdge",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 10,
        color: "black",
      },
      style: {
        strokeWidth: 3,
        stroke: "black",
      },
      data: {
        startLabel: "Output",
        endLabel: "Input",
      },
    },
  ])

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      if (params.source && params.target) {
        const edge = {
          id: `e${params.source}-${params.target}`,
          source: params.source,
          target: params.target,
          animated: true,
          type: "customEdge",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 10,
            color: "black",
          },
          style: {
            strokeWidth: 3,
            stroke: "black",
          },
          data: {
            startLabel: "Output",
            endLabel: "Input",
          },
        }
        console.log(edges)
        if (
          !edges.some(
            (edge) =>
              edge.id === `e${params.source}-${params.target}` ||
              edge.id === `e${params.target}-${params.source}`
          )
        ) {
          console.log("edge", edge)
          setEdges((edges) => edges.concat(edge))
        }
      }
    },
    [edges, setEdges]
  )

  const addSplitterNode = () => {
    const node = {
      id: (nodes.length + 1).toString(),
      position: { x: 0, y: nodes.length * 150 },
      type: "customNode",
      data: {
        name: `Splitter ${nodes.length + 1}`,
        updatable: true,
        selected: false,
      },
    }
    setNodes((nodes) => nodes.concat(node))
  }

  const removeSplitterNode = () => {
    if (nodes.length > 1) {
      setNodes((nodes) =>
        nodes.filter((n) => n.id !== (selectedNodeIdx + 1).toString())
      )
    }
  }

  const onNodeClick = (_: any, node: Node) => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, selected: n.id === node.id },
      }))
    )
    setSelectedNodeIdx(parseInt(node.id) - 1)
    setResetTrigger((prev) => prev + 1)
  }

  const contractInfoOnUpdate = (name: string, updatable: boolean) => {
    const node = {
      ...nodes[selectedNodeIdx],
      data: {
        ...nodes[selectedNodeIdx].data,
        name,
        updatable,
      },
    }
    setNodes((nodes) =>
      nodes.map((n) => (n.id === nodes[selectedNodeIdx].id ? node : n))
    )
  }

  return (
    <Layout full>
      <div className="mt-10">
        <PageHeader title="Drag & Drop Demo" subtitle="" />

        <Card>
          <div className="flex h-fit gap-2 rounded-2xl relative">
            <div
              className="flex flex-1"
              style={{ width: "100%", height: "calc(100vh - 280px)" }}
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodeClick={onNodeClick}
                panOnDrag
                snapToGrid
              >
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={10}
                  size={1}
                />
                <Controls />
                <MiniMap />
              </ReactFlow>
            </div>
            <div className="absolute flex flex-col flex-2 gap-4 right-[24px]">
              <button
                className="p-2 bg-[#FFDC93] rounded-lg"
                onClick={addSplitterNode}
              >
                Create Splitter
              </button>
              <button
                className="p-2 bg-red-400 rounded-lg"
                onClick={removeSplitterNode}
              >
                Remove Splitter
              </button>
              {nodes[selectedNodeIdx] && (
                <div className="flex flex-col gap-4 items-end w-[560px]">
                  <ContractInfoCard
                    data={{
                      owner: "0x123",
                      name: nodes[selectedNodeIdx].data.name,
                      updatable: nodes[selectedNodeIdx].data.updatable,
                    }}
                    totalDistributionsData={[]}
                    onUpdate={contractInfoOnUpdate}
                    edit={true}
                    reset={resetTrigger}
                    create
                  />
                  <ShareholdersCard
                    data={[
                      { address: "0x123", share: "50", domain: false },
                      { address: "0x456", share: "50", domain: false },
                    ]}
                    onUpdate={() => {}}
                    edit={true}
                    reset={resetTrigger}
                  />
                  <WhitelistedTokensCard
                    contractAddress={""}
                    data={[]}
                    onUpdate={() => {}}
                    edit={true}
                    reset={resetTrigger}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
