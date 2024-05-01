import PageHeader from "@/components/PageHeader"
import React, { useCallback, useMemo, useState } from "react"
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
  ConnectionMode,
} from "reactflow"
import "reactflow/dist/style.css"
import CustomNode, {
  NodeData,
} from "@/components/SplitterData/DragDrop/CustomNode"
import CustomEdge from "@/components/SplitterData/DragDrop/CustomEdge"
import Layout from "@/components/Layout"
import { WhitelistedTokensCardData } from "@/components/SplitterData/WhitelistedTokens"
import { ShareholderCardData } from "@/components/SplitterData/Shareholders"
import Card from "@/components/SplitterData/Card"
import useDeployer, { NetworkItemProps } from "@/hooks/contracts/useDeployer"
import { SplitterInputData } from "sorosplits-sdk/lib/contracts/Deployer"
import NetworkModal from "@/components/Modal/NetworkModal"
import useAppStore from "../../store"
import useModal from "@/hooks/modals/useConfirmation"
import { errorToast } from "@/utils/toast"
import Text from "@/components/Text"
import clsx from "clsx"
import { WhitelistedSwapTokensCardData } from "@/components/SplitterData/WhitelistedSwapTokens"
import parseContractError from "@/utils/parseContractError"

const nodeTypes = {
  customNode: CustomNode,
}
const initialNodes: Node<NodeData>[] = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    type: "customNode",
    data: {
      contractInfo: {
        name: "First Contract",
        updatable: true,
        isDiversifierActive: false,
      },
      shareholders: [
        {
          address: "GBOAWTUJNSI5VKE3MDGY32LJF723OCQ42XYLNJWXDHCJKRZSFV3PKKMY",
          share: "100",
          domain: false,
        },
      ],
      whitelistedTokens: [],
      whitelistedSwapTokens: [],
      selected: false,
    },
  },
  {
    id: "2",
    position: { x: 0, y: 200 },
    type: "customNode",
    data: {
      contractInfo: {
        name: "Second Contract",
        updatable: false,
        isDiversifierActive: true,
      },
      shareholders: [],
      whitelistedTokens: [],
      whitelistedSwapTokens: [],
      selected: false,
    },
  },
]

const edgeTypes = {
  customEdge: CustomEdge,
}

const edgeStyles = {
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 10,
    color: "black",
  },
  style: {
    stroke: "black",
    strokeWidth: 3,
  },
  animated: true,
  type: "customEdge",
}

export default function DragDrop() {
  const { deployNetwork } = useDeployer()
  const { walletAddress, isConnected, loading, setLoading } = useAppStore()
  const {
    onConfirmModal,
    onCancelModal,
    RenderModal,
    confirmModal: modalState,
  } = useModal()

  const [nodeId, setNodeId] = useState(3)
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false)
  const [resetTrigger, setResetTrigger] = useState(0)
  const [selectedNodeId, setSelectedNodeId] = useState(1)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    {
      id: `1-2`,
      source: "1",
      target: "2",
      data: {
        share: "10",
      },
      ...edgeStyles,
    },
  ])

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      if (params.source && params.target) {
        if (
          edges.some(
            (edge) =>
              edge.id === `${params.source}-${params.target}` ||
              edge.id === `${params.target}-${params.source}`
          )
        )
          return

        const edge = {
          id: `${params.source}-${params.target}`,
          source: params.source,
          target: params.target,
          data: {
            share: "10",
          },
          ...edgeStyles,
        }
        setEdges((edges) => edges.concat(edge))
      }
    },
    [edges, setEdges]
  )

  const addSplitterNode = (isDiversifierActive: boolean) => {
    const node = {
      id: nodeId.toString(),
      position: { x: 0, y: nodes.length * 50 },
      type: "customNode",
      data: {
        contractInfo: {
          name: `New Contract`,
          updatable: true,
          isDiversifierActive,
        },
        shareholders: [],
        whitelistedTokens: [],
        whitelistedSwapTokens: [],
        selected: false,
      },
    }
    setNodeId(nodeId + 1)
    setNodes((nodes) => nodes.concat(node))
  }

  const onNodeClick = (_: any, node: Node) => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, selected: n.id === node.id },
      }))
    )
    setSelectedNodeId(Number(node.id))
    setIsNetworkModalOpen(true)
  }

  const onPaneClick = () => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, selected: false },
      }))
    )
    setSelectedNodeId(0)
  }

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId.toString())
  }, [nodes, selectedNodeId])

  const selectedNodePreAllocations = useMemo(() => {
    let filteredEdges = edges.filter(
      (e) => e.target === selectedNodeId.toString()
    )
    if (edges.length === 0) return 0
    return filteredEdges.reduce(
      (acc: number, { data }) => acc + Number(data?.share) || 0,
      0
    )
  }, [selectedNode])

  const onContractInfoCardUpdate = (
    name: string,
    updatable: boolean,
    isDiversifierActive: boolean
  ) => {
    if (!selectedNode) return
    const node = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        contractInfo: { name, updatable, isDiversifierActive },
      },
    }
    setNodes((nodes) => nodes.map((n) => (n.id === selectedNode.id ? node : n)))
  }

  const onShareholderCardUpdate = (data: ShareholderCardData[]) => {
    if (!selectedNode) return
    const node = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        shareholders: data,
      },
    }
    setNodes((nodes) => nodes.map((n) => (n.id === selectedNode.id ? node : n)))
  }

  const onWhitelistedTokensCardUpdate = (data: WhitelistedTokensCardData[]) => {
    if (!selectedNode) return
    const node = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        whitelistedTokens: data,
      },
    }
    setNodes((nodes) => nodes.map((n) => (n.id === selectedNode.id ? node : n)))
  }

  const onWhitelistedSwapTokensCardUpdate = (
    data: WhitelistedSwapTokensCardData[]
  ) => {
    if (!selectedNode) return
    const node = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        whitelistedSwapTokens: data,
      },
    }
    setNodes((nodes) => nodes.map((n) => (n.id === selectedNode.id ? node : n)))
  }

  const onInfoReset = () => {
    if (!selectedNode) return
    const node = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        contractInfo: {
          name: `Splitter ${selectedNode.id}`,
          updatable: true,
          isDiversifierActive: false,
        },
        shareholders: [],
        whitelistedTokens: [],
      },
    }
    setNodes((nodes) => nodes.map((n) => (n.id === selectedNode.id ? node : n)))
    setResetTrigger(resetTrigger + 1)
    onCancelModal()
  }

  const processNodeData = (): NetworkItemProps[] => {
    const data: NetworkItemProps[] = []
    for (let node of nodes) {
      data.push({
        id: parseInt(node.id),
        isSplitter: !node.data.contractInfo.isDiversifierActive,
        data: {
          name: node.data.contractInfo.name,
          shares: node.data.shareholders.map((s: any) => {
            return {
              shareholder: s.address,
              share: Number(s.share) * 100,
            }
          }),
          updatable: node.data.contractInfo.updatable,
        },
        externalInputs: [],
      })
    }
    return data
  }

  const parseEdgeData = (currentNodeId: number) => {
    let data: SplitterInputData[] = []
    for (let edge of edges) {
      let source = parseInt(edge.source)
      let target = parseInt(edge.target)

      if (target === currentNodeId) {
        if (!edge.data || edge.data.share === "0" || edge.data.share === "")
          throw new Error("Edge must have a share value")

        data.push({
          id: source,
          share: Number(edge.data.share) * 100,
        })
      }
    }
    return data
  }

  const deployNetworkOnClick = async () => {
    try {
      setLoading(true)

      if (!isConnected) throw new Error("Please connect your wallet.")

      let data = processNodeData()
      for (let i = 0; i < data.length; i++) {
        data[i].externalInputs = parseEdgeData(data[i].id)
      }

      const contracts = await deployNetwork(data)

      console.log("CONTRACTS", contracts)
    } catch (error: any) {
      setLoading(false)
      errorToast(parseContractError(error))
    }
  }

  const innerModalOnConfirm = async () => {
    if (modalState[1] === "reset") onInfoReset()
    else await deployNetworkOnClick()
  }

  return (
    <Layout full>
      <div className="mt-10">
        <div className="mb-10">
          <PageHeader
            title="Create Contract Network"
            subtitle="Create a network of contracts for complex distribution flows."
          />
        </div>

        <Card>
          <div className="flex h-fit gap-2 rounded-2xl relative">
            <div
              className="flex flex-1"
              style={{ width: "100%", height: "calc(100vh - 300px)" }}
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
                onPaneClick={onPaneClick}
                connectionMode={ConnectionMode.Loose}
                panOnDrag
                snapToGrid
                fitView
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
              <CreateNodeButton
                title="Add Splitter"
                onClick={() => addSplitterNode(false)}
              />
              <CreateNodeButton
                title="Add Diversifier"
                onClick={() => addSplitterNode(true)}
              />
              <CreateNodeButton
                title="Deploy Network"
                onClick={deployNetworkOnClick}
              />
            </div>
          </div>
        </Card>
      </div>

      {selectedNode && (
        <>
          <NetworkModal
            isOpen={isNetworkModalOpen}
            title="Update Node"
            doneButtonOnClick={() => {
              onPaneClick()
              setIsNetworkModalOpen(false)
            }}
            resetButtonOnClick={() => onConfirmModal("reset")}
            contractInfoData={{
              ...selectedNode.data.contractInfo,
              owner: walletAddress || "",
            }}
            onContractInfoCardUpdate={onContractInfoCardUpdate}
            shareholderCardData={selectedNode.data.shareholders}
            preAllocation={selectedNodePreAllocations}
            onShareholderCardUpdate={onShareholderCardUpdate}
            whitelistTokenCardData={selectedNode.data.whitelistedTokens}
            onWhitelistedTokensCardUpdate={onWhitelistedTokensCardUpdate}
            whitelistedSwapTokenCardData={
              selectedNode.data.whitelistedSwapTokens
            }
            onWhitelistedSwapTokensCardUpdate={
              onWhitelistedSwapTokensCardUpdate
            }
            reset={resetTrigger}
          />
          <RenderModal
            title="Are you sure you want to reset your changes?"
            message={undefined}
            onConfirm={innerModalOnConfirm}
          />
        </>
      )}
    </Layout>
  )
}

const CreateNodeButton = ({
  title,
  onClick,
}: {
  title: string
  onClick: () => void
}) => {
  return (
    <button
      className={clsx(
        "flex items-center justify-center w-[200px] h-[60px] border-2 border-black rounded-2xl bg-white"
      )}
      onClick={onClick}
    >
      <Text text={title} color="#000000" size="16" />
    </button>
  )
}
