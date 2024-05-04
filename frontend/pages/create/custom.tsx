import React, { useMemo, useState } from "react"
import Layout from "@/components/Layout"
import PageHeader from "@/components/PageHeader"
import { ShareholderCardData } from "@/components/SplitterData/Shareholders"
import { WhitelistedTokensCardData } from "@/components/SplitterData/WhitelistedTokens"
import useConfirmationModal from "@/hooks/modals/useConfirmation"
import useCustomSuccess from "@/hooks/modals/useCustomSuccess"
import useAppStore from "@/store/index"
import checkSplitterData from "@/utils/checkSplitterData"
import { errorToast, loadingToast, successToast } from "@/utils/toast"
import { useRouter } from "next/router"
import Create from "@/components/SplitterData/Create"
import useDeployer from "@/hooks/contracts/useDeployer"
import useSplitter from "@/hooks/contracts/useSplitter"
import { WhitelistedSwapTokensCardData } from "@/components/SplitterData/WhitelistedSwapTokens"
import useDiversifier from "@/hooks/contracts/useDiversifier"
import { downloadContracts } from "@/utils/downloadContracts"
import { SuccessContractDetails } from "@/components/Modal/CustomSuccessModal"

const CreateCustomSplitter = () => {
  const { push } = useRouter()
  const deployer = useDeployer()
  const splitter = useSplitter()
  const diversifier = useDiversifier()
  const { walletAddress, setLoading, isConnected } = useAppStore()

  const { confirmModal, onConfirmModal, RenderModal, onCancelModal } =
    useConfirmationModal()
  const {
    RenderModal: CustomSuccessModal,
    setIsOpen: setCustomSuccessModalIsOpen,
  } = useCustomSuccess()

  const [contractName, setContractName] = useState<string>("")
  const [contractUpdatable, setContractUpdatable] = useState<boolean>(true)
  const [contractIsDiversifierActive, setContractIsDiversifierActive] =
    useState<boolean>(false)
  const [contractShares, setContractShares] = useState<ShareholderCardData[]>(
    []
  )
  const [contractWhitelistedTokens, setContractWhitelistedTokens] = useState<
    WhitelistedTokensCardData[]
  >([])
  const [contractWhitelistedSwapTokens, setContractWhitelistedSwapTokensCard] =
    useState<WhitelistedSwapTokensCardData[]>([])
  const [resetTrigger, setResetTrigger] = useState<number>(0)

  const [diversifierAddress, setDiversifierAddress] = useState("")
  const [splitterAddress, setSplitterAddress] = useState("")
  const [deployedContracts, setDeployedContracts] = useState<
    SuccessContractDetails[]
  >([])

  const contractInfoData = useMemo(() => {
    return {
      owner: walletAddress || "",
      name: contractName,
      updatable: contractUpdatable,
      isDiversifierActive: contractIsDiversifierActive,
    }
  }, [
    contractName,
    contractUpdatable,
    contractIsDiversifierActive,
    walletAddress,
  ])

  const shareholderCardData = useMemo(() => {
    if (!contractShares) return []
    return contractShares.map((i) => {
      return {
        address: i.address.toString(),
        share: i.share.toString(),
        // TODO: Need to check domain in here
        domain: false,
      }
    })
  }, [contractShares])

  const doneButtonOnClick = () => {
    onConfirmModal("done")
  }

  const resetButtonOnClick = () => {
    onConfirmModal("reset")
  }

  const modalOnConfirm = async () => {
    if (confirmModal[1] === "reset") resetStates()
    else await deploySplitter()
  }

  const deploySplitter = async () => {
    try {
      setLoading(true)

      if (!isConnected) throw new Error("Please connect your wallet.")

      let shares = contractShares.map((i) => {
        return {
          share: Number(i.share) * 100,
          shareholder: i.address,
        }
      })

      checkSplitterData(shares)

      loadingToast("Creating your contract...")
      const contractAddress = await deployer.deployDiversifier({
        name: contractName,
        shares,
        updatable: contractUpdatable,
        isDiversifierActive: contractIsDiversifierActive,
      })
      successToast("Contract initialized successfully!")

      const diversifierConfig = await diversifier.query.getDiversifierConfig(
        contractAddress
      )
      setDiversifierAddress(contractAddress)
      setSplitterAddress(diversifierConfig.splitter_address)
      setDeployedContracts([
        {
          name: contractName,
          splitter: diversifierConfig.splitter_address,
          diversifier: contractAddress,
        },
      ])

      if (contractWhitelistedTokens.length != 0) {
        loadingToast("Updating whitelisted tokens...")
        await splitter.call.updateWhitelistedTokens(
          contractAddress,
          contractWhitelistedTokens.map((i) => i.address)
        )
        successToast("Whitelisted tokens updated successfully!")
      }

      if (contractIsDiversifierActive) {
        loadingToast("Updating diversifier swap tokens...")
        for (let item of contractWhitelistedSwapTokens) {
          await diversifier.call.updateWhitelistedSwapTokens(
            contractAddress,
            item.token.address,
            item.swapTokens.map((i) => i.address)
          )
        }
        successToast("Diversifier swap tokens updated successfully!")
      }

      setLoading(false)
      onCancelModal()
      setCustomSuccessModalIsOpen(true)
    } catch (error: any) {
      setLoading(false)
      errorToast(error)
    }
  }

  const resetStates = () => {
    onContractInfoCardUpdate("", true, false)
    onShareholderCardUpdate([])
    onWhitelistedTokensCardUpdate([])
    setResetTrigger((prev) => prev + 1)
    onCancelModal()
  }

  const onContractInfoCardUpdate = (
    name: string,
    updatable: boolean,
    isDiversifierActive: boolean
  ) => {
    setContractName(name)
    setContractUpdatable(updatable)
    setContractIsDiversifierActive(isDiversifierActive)
  }

  const onShareholderCardUpdate = (data: ShareholderCardData[]) => {
    setContractShares(data)
  }

  const onWhitelistedTokensCardUpdate = (data: WhitelistedTokensCardData[]) => {
    setContractWhitelistedTokens(data)
    setContractWhitelistedSwapTokensCard(
      data.map((i) => ({ token: i, swapTokens: [] }))
    )
  }

  const onWhitelistedSwapTokensCardUpdate = (
    data: WhitelistedSwapTokensCardData[]
  ) => {
    setContractWhitelistedSwapTokensCard(data)
  }

  const successModalOnConfirm = () => {
    setLoading(false)
    push(`/search?address=${diversifierAddress}`)
  }

  return (
    <Layout>
      <div className="mt-10">
        <PageHeader
          title="Create Custom Contract"
          subtitle="Create a new contract for distributing tokens to shareholders."
        />

        <Create
          doneButtonOnClick={doneButtonOnClick}
          resetButtonOnClick={resetButtonOnClick}
          contractInfoData={contractInfoData}
          onContractInfoCardUpdate={onContractInfoCardUpdate}
          shareholderCardData={shareholderCardData}
          onShareholderCardUpdate={onShareholderCardUpdate}
          whitelistTokenCardData={contractWhitelistedTokens}
          onWhitelistedTokensCardUpdate={onWhitelistedTokensCardUpdate}
          whitelistSwapTokenCardData={contractWhitelistedSwapTokens}
          onWhitelistedSwapTokensCardUpdate={onWhitelistedSwapTokensCardUpdate}
          reset={resetTrigger}
          preAllocation={0}
        />

        <RenderModal
          title={
            confirmModal[1] === "done"
              ? "You are about to create your contract."
              : "Are you sure you want to reset your changes?"
          }
          message={
            confirmModal[1] === "done"
              ? "Do you want to confirm your changes?"
              : undefined
          }
          onConfirm={modalOnConfirm}
        />
        <CustomSuccessModal
          contracts={deployedContracts}
          onDownload={() => downloadContracts(deployedContracts)}
          onConfirm={successModalOnConfirm}
        />
      </div>
    </Layout>
  )
}

export default CreateCustomSplitter
