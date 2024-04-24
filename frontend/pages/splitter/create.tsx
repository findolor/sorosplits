import React, { useMemo, useState } from "react"
import Layout from "@/components/Layout"
import PageHeader from "@/components/PageHeader"
import { ShareholderCardData } from "@/components/SplitterData/Shareholders"
import { WhitelistedTokensCardData } from "@/components/SplitterData/WhitelistedTokens"
import useModal from "@/hooks/modals/useConfirmation"
import useAppStore from "@/store/index"
import checkSplitterData from "@/utils/checkSplitterData"
import { errorToast, loadingToast, successToast } from "@/utils/toast"
import { useRouter } from "next/router"
import Create from "@/components/SplitterData/Create"
import useDeployer from "@/hooks/contracts/useDeployer"

const CreateSplitter = () => {
  const { push } = useRouter()
  const deployer = useDeployer()
  const { walletAddress, setLoading, isConnected } = useAppStore()
  const { confirmModal, onConfirmModal, RenderModal, onCancelModal } =
    useModal()

  const [contractName, setContractName] = useState<string>("TESSTTT")
  const [contractUpdatable, setContractUpdatable] = useState<boolean>(true)
  const [contractIsDiversifierActive, setContractIsDiversifierActive] =
    useState<boolean>(false)
  const [contractShares, setContractShares] = useState<ShareholderCardData[]>([
    {
      address: "GBOAWTUJNSI5VKE3MDGY32LJF723OCQ42XYLNJWXDHCJKRZSFV3PKKMY",
      share: "20",
      domain: false,
    },
    {
      address: "CCGQUEH2MSJVP4EAYCE6USCCJ3HAE5JUPZZIKT462XXDP2ZZVJ6AAQTE",
      share: "80",
      domain: false,
    },
  ])
  const [contractWhitelistedTokens, setContractWhitelistedTokens] = useState<
    string[]
  >([])
  const [resetTrigger, setResetTrigger] = useState<number>(0)

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

  const whitelistTokenCardData = useMemo(() => {
    if (!contractWhitelistedTokens) return []
    return contractWhitelistedTokens.map((i) => {
      return {
        address: i,
        name: "",
        symbol: "",
        decimals: 0,
        balance: "0.00",
      }
    })
  }, [contractWhitelistedTokens])

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

      loadingToast("Creating your Splitter contract...")
      const contractAddress = await deployer.deployDiversifier({
        name: contractName,
        shares,
        updatable: contractUpdatable,
        isDiversifierActive: contractIsDiversifierActive,
      })
      successToast("Splitter contract initialized successfully!")

      // if (contractWhitelistedTokens.length != 0) {
      //   loadingToast("Updating whitelisted tokens...")
      //   await splitter.call.updateWhitelistedTokens(
      //     contractAddress,
      //     contractWhitelistedTokens
      //   )
      //   successToast("Whitelisted tokens updated successfully!")
      // }

      successToast("Navigating to contract page...")

      setTimeout(() => {
        setLoading(false)
        push(`/splitter/search?address=${contractAddress}`)
      }, 2000)
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
    setContractWhitelistedTokens(data.map((i) => i.address))
  }

  return (
    <Layout>
      <div className="mt-10">
        <PageHeader
          title="Create Contract"
          subtitle="Create a new contract for distributing tokens to shareholders."
        />

        <Create
          doneButtonOnClick={doneButtonOnClick}
          resetButtonOnClick={resetButtonOnClick}
          contractInfoData={contractInfoData}
          onContractInfoCardUpdate={onContractInfoCardUpdate}
          shareholderCardData={shareholderCardData}
          onShareholderCardUpdate={onShareholderCardUpdate}
          whitelistTokenCardData={whitelistTokenCardData}
          onWhitelistedTokensCardUpdate={onWhitelistedTokensCardUpdate}
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
      </div>
    </Layout>
  )
}

export default CreateSplitter
