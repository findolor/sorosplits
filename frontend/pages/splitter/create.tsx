import {
  CreateSplitterDoneButton,
  CreateSplitterResetButton,
} from "@/components/Button/Splitter"
import Layout from "@/components/Layout"
import ConfirmationModal from "@/components/Modal"
import PageHeader from "@/components/PageHeader"
import ContractInfoCard from "@/components/SplitterData/ContractInfo"
import ShareholdersCard, {
  ShareholderCardData,
} from "@/components/SplitterData/Shareholders"
import WhitelistedTokensCard, {
  WhitelistedTokensCardData,
} from "@/components/SplitterData/WhitelistedTokens"
import useModal from "@/hooks/useModal"
import useSplitter from "@/hooks/useSplitter"
import useAppStore from "@/store/index"
import checkSplitterData from "@/utils/checkSplitterData"
import { errorToast, loadingToast, successToast } from "@/utils/toast"
import { ShareDataProps } from "@sorosplits/sdk/lib/contracts/Splitter"
import { useRouter } from "next/router"
import React, { useMemo, useState } from "react"

const CreateSplitter = () => {
  const { push } = useRouter()
  const splitter = useSplitter()
  const { walletAddress, setLoading, isConnected } = useAppStore()
  const { confirmModal, onConfirmModal, onCancelModal, RenderModal } =
    useModal()

  const [contractName, setContractName] = useState<string>("")
  const [contractUpdatable, setContractUpdatable] = useState<boolean>(true)
  const [contractShares, setContractShares] = useState<ShareDataProps[]>([])
  const [contractWhitelistedTokens, setContractWhitelistedTokens] = useState<
    string[]
  >([])
  const [resetTrigger, setResetTrigger] = useState<number>(0)

  const contractInfoData = useMemo(() => {
    return {
      owner: walletAddress || "",
      name: contractName,
      updatable: contractUpdatable,
    }
  }, [contractName, contractUpdatable, walletAddress])

  const shareholderCardData = useMemo(() => {
    if (!contractShares) return []
    return contractShares.map((i) => {
      return {
        address: i.shareholder.toString(),
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

  const modalDoneOnClick = () => {
    onConfirmModal("done")
  }

  const modalResetOnClick = () => {
    onConfirmModal("reset")
  }

  const onConfirm = async () => {
    if (confirmModal[1] === "reset") resetStates()
    else await deploySplitter()
  }

  const deploySplitter = async () => {
    try {
      setLoading(true)

      if (!isConnected) throw new Error("Please connect your wallet.")

      checkSplitterData(contractShares)

      loadingToast("Creating your Splitter contract...")
      const contractAddress = await splitter.createSplitter(
        contractName,
        contractShares.map((item) => {
          return {
            ...item,
            share: item.share * 100,
          }
        }),
        contractUpdatable
      )
      successToast("Splitter contract initialized successfully!")

      if (contractWhitelistedTokens.length != 0) {
        loadingToast("Updating whitelisted tokens...")
        await splitter.call.updateWhitelistedTokens(
          contractAddress,
          contractWhitelistedTokens
        )
        successToast("Whitelisted tokens updated successfully!")
      }

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
    setContractName("")
    setContractUpdatable(true)
    setContractShares([])
    setContractWhitelistedTokens([])
    setResetTrigger((prev) => prev + 1)
    modalResetOnClick()
  }

  const onContractInfoCardUpdate = (name: string, updatable: boolean) => {
    setContractName(name)
    setContractUpdatable(updatable)
  }

  const onShareholderCardUpdate = (data: ShareholderCardData[]) => {
    setContractShares(
      data.map((i) => {
        return {
          shareholder: i.address,
          share: Number(i.share),
        }
      })
    )
  }

  const onWhitelistedTokensCardUpdate = (data: WhitelistedTokensCardData[]) => {
    setContractWhitelistedTokens(data.map((i) => i.address))
  }

  return (
    <Layout>
      <div className="mt-10">
        <PageHeader
          title="Create Splitter"
          subtitle="Create a new splitter contract for distributing tokens to shareholders."
        />

        <div className="flex flex-col justify-between mt-10 px-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <CreateSplitterDoneButton onClick={modalDoneOnClick} />
            </div>
            <CreateSplitterResetButton onClick={modalResetOnClick} />
          </div>

          <div className="flex justify-between">
            <div className="flex flex-col gap-4 w-[560px]">
              <ShareholdersCard
                data={shareholderCardData}
                onUpdate={onShareholderCardUpdate}
                edit={true}
                reset={resetTrigger}
              />

              <WhitelistedTokensCard
                contractAddress={""}
                data={whitelistTokenCardData}
                onUpdate={onWhitelistedTokensCardUpdate}
                edit={true}
                reset={resetTrigger}
              />
            </div>

            <div className="flex flex-col gap-4 w-[423px]">
              <ContractInfoCard
                data={contractInfoData}
                totalDistributionsData={[]}
                onUpdate={onContractInfoCardUpdate}
                edit={true}
                reset={resetTrigger}
                create
              />
            </div>
          </div>
        </div>

        <RenderModal
          title={
            confirmModal[1] === "done"
              ? "You are about to create your splitter."
              : "Are you sure you want to reset your changes?"
          }
          message={
            confirmModal[1] === "done"
              ? "Do you want to confirm your changes?"
              : undefined
          }
          onConfirm={onConfirm}
        />
      </div>
    </Layout>
  )
}

export default CreateSplitter
