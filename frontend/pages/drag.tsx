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
} from "reactflow"
import "reactflow/dist/style.css"
import CustomNode from "@/components/SplitterData/DragDrop/CustomNode"
import CustomEdge from "@/components/SplitterData/DragDrop/RemoveEdge"
import Layout from "@/components/Layout"
import { WhitelistedTokensCardData } from "@/components/SplitterData/WhitelistedTokens"
import { ShareholderCardData } from "@/components/SplitterData/Shareholders"
import Card from "@/components/SplitterData/Card"
import useDeployer, { NetworkItemProps } from "@/hooks/contracts/useDeployer"
import { SplitterInputData } from "@sorosplits/sdk/lib/contracts/Deployer"
import NetworkModal from "@/components/Modal/NetworkModal"
import useAppStore from "../store"
import useModal from "@/hooks/modals/useConfirmation"
import { errorToast } from "@/utils/toast"

interface NodeData {
  contractInfo: {
    name: string
    updatable: boolean
  }
  shareholders: ShareholderCardData[]
  whitelistedTokens: WhitelistedTokensCardData[]
  selected: boolean
}

const nodeTypes = {
  customNode: CustomNode,
}
const initialNodes: Node<NodeData>[] = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    type: "customNode",
    data: {
      contractInfo: { name: "Splitter 1", updatable: true },
      shareholders: [
        {
          address: "GBOAWTUJNSI5VKE3MDGY32LJF723OCQ42XYLNJWXDHCJKRZSFV3PKKMY",
          share: "50.20",
          domain: false,
        },
        {
          address: "CC6GWVZGNUCAWJ75GFM2TU7F4VWGL4GUCS6JY2FZ6OURZTMJ73S376QA",
          share: "49.80",
          domain: false,
        },
      ],
      whitelistedTokens: [],
      selected: true,
    },
  },
  {
    id: "2",
    position: { x: 0, y: 200 },
    type: "customNode",
    data: {
      contractInfo: { name: "Splitter 2", updatable: false },
      shareholders: [
        {
          address: "GAVQEABESF6XMJICZV2QG33FPSGOUVDZC26DFWKIFZHPM6JATZVNBBQ4",
          share: "15",
          domain: false,
        },
        {
          address: "CDDFKGLR457OI6QXQ2REMS4YEL56DBUIKVH2ZCBKNGLUYWM52JMWSVNR",
          share: "50",
          domain: false,
        },
        {
          address: "GBOAWTUJNSI5VKE3MDGY32LJF723OCQ42XYLNJWXDHCJKRZSFV3PKKMY",
          share: "10",
          domain: true,
          domainName: "sorosplits.xlm",
        },
      ],
      whitelistedTokens: [],
      selected: true,
    },
  },
]

const edgeTypes = {
  customEdge: CustomEdge,
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

  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false)
  const [resetTrigger, setResetTrigger] = useState(0)
  const [selectedNodeId, setSelectedNodeId] = useState(1)
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
        if (
          !edges.some(
            (edge) =>
              edge.id === `e${params.source}-${params.target}` ||
              edge.id === `e${params.target}-${params.source}`
          )
        ) {
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
        contractInfo: { name: `Splitter ${nodes.length + 1}`, updatable: true },
        shareholders: [],
        whitelistedTokens: [],
        selected: false,
      },
    }
    setNodes((nodes) => nodes.concat(node))
  }

  const removeSplitterNode = () => {
    if (nodes.length > 1) {
      setNodes((nodes) =>
        nodes.filter((n) => n.id !== selectedNodeId.toString())
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
    setSelectedNodeId(Number(node.id))
    setIsNetworkModalOpen(true)
  }

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId.toString())
  }, [nodes, selectedNodeId])

  const onContractInfoCardUpdate = (name: string, updatable: boolean) => {
    if (!selectedNode) return
    const node = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        contractInfo: { name, updatable },
      },
    }
    console.log("NODE", node.data.contractInfo)
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

  const onInfoReset = () => {
    if (!selectedNode) return
    const node = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        contractInfo: {
          name: `Splitter ${selectedNode.id}`,
          updatable: true,
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
        isSplitter: true,
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
        data.push({
          id: source,
          share: 2500, // TODO: Get this from the user
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
    } catch (error) {
      setLoading(false)
      errorToast(error)
    }
  }

  const innerModalOnConfirm = async () => {
    if (modalState[1] === "reset") onInfoReset()
    else await deployNetworkOnClick()
  }

  return (
    <Layout full>
      <div className="mt-10">
        <PageHeader title="Splitter Network" subtitle="" />

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
              <button
                className="p-2 bg-[#FFDC93] rounded-lg"
                onClick={deployNetworkOnClick}
              >
                DEPLOY NETWORK
              </button>
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
            </div>
          </div>
        </Card>
      </div>

      {selectedNode && (
        <>
          <NetworkModal
            isOpen={isNetworkModalOpen}
            title="Update Node"
            doneButtonOnClick={() => setIsNetworkModalOpen(false)}
            resetButtonOnClick={() => onConfirmModal("reset")}
            contractInfoData={{
              ...selectedNode.data.contractInfo,
              owner: walletAddress || "",
            }}
            onContractInfoCardUpdate={onContractInfoCardUpdate}
            shareholderCardData={selectedNode.data.shareholders}
            onShareholderCardUpdate={onShareholderCardUpdate}
            whitelistTokenCardData={selectedNode.data.whitelistedTokens}
            onWhitelistedTokensCardUpdate={onWhitelistedTokensCardUpdate}
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
