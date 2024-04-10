import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import Search from "@/components/Input/Search"
import PageHeader from "@/components/PageHeader"
import ContractInfoCard, {
  TokenBalanceData,
} from "@/components/SplitterData/ContractInfo"
import ShareholdersCard, {
  ShareholderCardData,
} from "@/components/SplitterData/Shareholders"
import {
  ContractConfigResult,
  ShareDataProps,
} from "@sorosplits/sdk/lib/contracts/Splitter"
import useAppStore from "@/store/index"
import { loadingToast, successToast, errorToast } from "@/utils/toast"
import {
  ManageSplitterButton,
  ManageSplitterCancelButton,
  ManageSplitterDoneButton,
  PinSplitterButton,
  UnpinSplitterButton,
} from "@/components/Button/Splitter"
import WhitelistedTokensCard, {
  WhitelistedTokensCardData,
} from "@/components/SplitterData/WhitelistedTokens"
import ActivityCard, {
  SplitterContractActivity,
} from "@/components/SplitterData/Activity"
import useSplitter from "@/hooks/useSplitter"
import useToken from "@/hooks/useToken"
import useModal from "@/hooks/useModal"
import { getBalance } from "@/utils/getBalance"
import Layout from "@/components/Layout"
import Loading from "@/components/Loading"

const NewSearch: React.FC = () => {
  const router = useRouter()
  const splitter = useSplitter()
  const token = useToken()
  const { walletAddress, setLoading, isConnected } = useAppStore()
  const { confirmModal, onConfirmModal, onCancelModal, RenderModal } =
    useModal()

  const [contractAddress, setContractAddress] = useState("")

  // Initial state for contract data
  // Comes from the contract itself
  const [contractConfig, setContractConfig] = useState<ContractConfigResult>()
  const [contractShares, setContractShares] = useState<ShareDataProps[]>()
  const [contractWhitelistedTokens, setContractWhitelistedTokens] = useState<
    string[]
  >([])
  const [contractTransactions, setContractTransactions] = useState<
    SplitterContractActivity[]
  >([])

  // Derived data from contract data
  const [whitelistedTokensCardData, setWhitelistedTokensCardData] = useState<
    WhitelistedTokensCardData[]
  >([])
  const [
    whitelistedTokensCardDataLoading,
    setWhitelistedTokensCardDataLoading,
  ] = useState(true)
  const [contractTotalDistributionsData, setContractTotalDistributionsData] =
    useState<TokenBalanceData[]>([])

  // Updated state for contract data
  const [updatedContractName, setUpdatedContractName] = useState("")
  const [updatedContractUpdatable, setUpdatedContractUpdatable] = useState(true)
  const [updatedContractShares, setUpdatedContractShares] = useState<
    ShareDataProps[]
  >([])
  const [
    updatedContractWhitelistedTokens,
    setUpdatedContractWhitelistedTokens,
  ] = useState<string[]>([])

  // UI state
  const [manageSplitter, setManageSplitter] = useState(false)
  const [resetTrigger, setResetTrigger] = useState(0)

  // TODO: Get this from api
  const [[isPinned, isPinnedLoading], setIsPinned] = useState([false, true])

  useEffect(() => {
    if (router.query.address) {
      setContractAddress(router.query.address as string)
    }
  }, [router.query])

  useEffect(() => {
    if (contractAddress != "") {
      router.push(
        {
          pathname: router.pathname,
          query: { address: contractAddress },
        },
        undefined,
        { shallow: true }
      )
    }
  }, [contractAddress])

  const onContractAddressChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setContractAddress(event.target.value)
  }

  const manageSplitterOnClick = () => {
    setManageSplitter(true)
  }

  const manageSplitterDoneOnClick = () => {
    onConfirmModal("done")
  }

  const manageSplitterCancelOnClick = () => {
    onConfirmModal("cancel")
  }

  useEffect(() => {
    const fetchContractData = setTimeout(async () => {
      try {
        if (contractAddress === "") {
          setContractConfig(undefined)
          setContractShares(undefined)
          setContractWhitelistedTokens([])
          setWhitelistedTokensCardData([])
          setWhitelistedTokensCardDataLoading(true)
          setContractTransactions([])
          return
        }

        loadingToast("Searching for Splitter contract...")

        const config = await splitter.query.getConfig(contractAddress)
        setContractConfig(config)
        setUpdatedContractName(new TextDecoder().decode(config.name).toString())
        setUpdatedContractUpdatable(config.updatable)

        const shares = await splitter.query.listShares(contractAddress)
        let shareData = shares.map((item) => {
          return {
            shareholder: item.shareholder.toString(),
            share: Number(BigInt(item.share)) / 100,
          }
        })
        setContractShares(shareData)
        setUpdatedContractShares(shareData)

        const whitelistedTokens = await splitter.query.listWhitelistedTokens(
          contractAddress
        )
        setContractWhitelistedTokens(whitelistedTokens)
        setUpdatedContractWhitelistedTokens(whitelistedTokens)

        successToast("Splitter contract found!")
      } catch (error: any) {
        setContractConfig(undefined)
        setContractShares(undefined)
        errorToast(error)
      }
    }, 1000)

    return () => clearTimeout(fetchContractData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractAddress])

  useEffect(() => {
    const fetch = async () => {
      if (contractAddress === "") return

      const data = await splitter.getActivity(contractAddress)
      setContractTransactions(data)
    }

    if (contractShares && contractConfig && contractWhitelistedTokens) {
      fetch()
    }
  }, [contractShares, contractConfig, contractWhitelistedTokens])

  const shareholdersCardData = useMemo(() => {
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

  const contractInfoCardData = useMemo(() => {
    if (!contractConfig)
      return {
        owner: "",
        name: "",
        updatable: false,
      }
    return {
      owner: contractConfig.admin.toString(),
      name: new TextDecoder().decode(contractConfig.name).toString(),
      updatable: contractConfig.updatable,
      balances: [],
      totalDistributions: [],
    }
  }, [contractConfig])

  useEffect(() => {
    const fetch = async () => {
      if (contractAddress === "" || contractWhitelistedTokens.length === 0) {
        setWhitelistedTokensCardDataLoading(false)
        return
      }

      setWhitelistedTokensCardDataLoading(true)

      let whitelistedTokensCardData: WhitelistedTokensCardData[] = []

      for (let tokenAddress of contractWhitelistedTokens) {
        const tokenName = await token.query.getName(tokenAddress)
        const tokenSymbol = await token.query.getSymbol(tokenAddress)
        const tokenDecimal = await token.query.getDecimal(tokenAddress)
        const tokenAmount = await token.query.getBalance(
          tokenAddress,
          contractAddress
        )

        whitelistedTokensCardData.push({
          address: tokenAddress,
          name: tokenName,
          symbol: tokenSymbol,
          decimals: tokenDecimal,
          balance: getBalance(tokenAmount, tokenDecimal).toFixed(2),
        })
      }

      setWhitelistedTokensCardData(whitelistedTokensCardData)
      setWhitelistedTokensCardDataLoading(false)
    }

    fetch()
  }, [contractAddress, contractWhitelistedTokens])

  const onConfirm = async () => {
    if (confirmModal[1] === "cancel") {
      setResetTrigger((prev) => prev + 1)
      setManageSplitter(false)
      onCancelModal()
    } else await updateSplitter()
  }

  const checkUpdates = () => {
    if (!contractConfig || !contractShares) {
      throw new Error("No contract data found")
    }

    const nameUpdated =
      updatedContractName !=
      new TextDecoder().decode(contractConfig.name).toString()
    const updatableUpdated =
      updatedContractUpdatable != contractConfig.updatable
    const sharesUpdated =
      JSON.stringify(
        updatedContractShares.sort((a, b) =>
          a.shareholder.localeCompare(b.shareholder)
        )
      ) !=
      JSON.stringify(
        contractShares
          .map((i) => ({
            shareholder: i.shareholder.toString(),
            share: Number(i.share.toString()),
          }))
          .sort((a, b) => a.shareholder.localeCompare(b.shareholder))
      )
    const whitelistedTokensUpdated =
      JSON.stringify(
        updatedContractWhitelistedTokens.sort((a, b) => a.localeCompare(b))
      ) !=
      JSON.stringify(
        contractWhitelistedTokens.sort((a, b) => a.localeCompare(b))
      )

    return {
      name: nameUpdated,
      updatable: updatableUpdated,
      shares: sharesUpdated,
      whitelistedTokens: whitelistedTokensUpdated,
    }
  }

  const updateSplitter = async () => {
    loadingToast("Updating your Splitter contract...")

    try {
      setLoading(true)

      const updates = checkUpdates()
      if (
        !updates.name &&
        !updates.updatable &&
        !updates.shares &&
        !updates.whitelistedTokens
      ) {
        throw new Error("No changes detected")
      }

      if (updates.name) {
        await splitter.call.updateName(contractAddress, updatedContractName)
        setContractConfig((prev) => {
          if (!prev) return prev
          return Object.assign({}, prev, {
            name: new TextEncoder().encode(updatedContractName),
          })
        })
      }
      if (updates.updatable) {
        await splitter.call.lockContract(contractAddress)
        setContractConfig((prev) => {
          if (!prev) return prev
          return Object.assign({}, prev, {
            updatable: false,
          })
        })
      }
      if (updates.shares) {
        await splitter.call.updateShares(
          contractAddress,
          updatedContractShares.map((item) => {
            return {
              ...item,
              share: item.share * 100,
            }
          })
        )
        setContractShares(updatedContractShares)
      }
      if (updates.whitelistedTokens) {
        await splitter.call.updateWhitelistedTokens(
          contractAddress,
          updatedContractWhitelistedTokens
        )
        setContractWhitelistedTokens(updatedContractWhitelistedTokens)
      }

      setLoading(false)
      setManageSplitter(false)
      successToast("Splitter contract updated successfully!")
      onCancelModal()
    } catch (error: any) {
      setLoading(false)
      errorToast(error)
    }
  }

  const onContractInfoCardUpdate = (name: string, updatable: boolean) => {
    setUpdatedContractName(name)
    setUpdatedContractUpdatable(updatable)
  }

  const onShareholderCardUpdate = (data: ShareholderCardData[]) => {
    setUpdatedContractShares(
      data.map((i) => {
        return {
          shareholder: i.address,
          share: Number(i.share),
        }
      })
    )
  }

  const onWhitelistedTokensCardUpdate = (data: WhitelistedTokensCardData[]) => {
    setUpdatedContractWhitelistedTokens(data.map((i) => i.address))
  }

  useEffect(() => {
    const fetch = async () => {
      if (!isConnected || contractAddress === "") return
      const data = await splitter.isPinned(contractAddress)
      setIsPinned([data, false])
    }

    fetch()
  }, [contractAddress, isConnected])

  const togglePinSplitter = async () => {
    try {
      if (isPinnedLoading) return
      setIsPinned([isPinned, true])
      await splitter.togglePin(contractAddress)
      setIsPinned([!isPinned, false])
    } catch (error: any) {
      errorToast(error)
    }
  }

  return (
    <Layout>
      <div className="mt-10">
        <PageHeader
          title="Search Splitter"
          subtitle="Display information about a splitter contract by entering the address below."
        />

        <div className="flex justify-center mt-10">
          <Search
            placeholder="Enter splitter address"
            onChange={onContractAddressChange}
            value={contractAddress}
          />
        </div>

        {contractConfig && contractShares && (
          <div className="flex flex-col justify-between mt-6 px-3">
            {isConnected && (
              <div className="flex items-center justify-between mb-2">
                {walletAddress === contractConfig.admin.toString() && (
                  <div>
                    {manageSplitter ? (
                      <ManageSplitterDoneButton
                        onClick={manageSplitterDoneOnClick}
                      />
                    ) : (
                      <ManageSplitterButton onClick={manageSplitterOnClick} />
                    )}
                  </div>
                )}
                {!manageSplitter && (
                  <>
                    {isPinnedLoading ? (
                      <Loading small />
                    ) : (
                      <>
                        {isPinned ? (
                          <UnpinSplitterButton onClick={togglePinSplitter} />
                        ) : (
                          <PinSplitterButton onClick={togglePinSplitter} />
                        )}
                      </>
                    )}
                  </>
                )}
                {manageSplitter && (
                  <ManageSplitterCancelButton
                    onClick={manageSplitterCancelOnClick}
                  />
                )}
              </div>
            )}

            <div className="flex justify-between">
              <div className="flex flex-col gap-4 w-[560px]">
                <ShareholdersCard
                  data={shareholdersCardData}
                  onUpdate={onShareholderCardUpdate}
                  edit={manageSplitter}
                  reset={resetTrigger}
                />
                <WhitelistedTokensCard
                  contractAddress={contractAddress}
                  data={whitelistedTokensCardData}
                  dataLoading={whitelistedTokensCardDataLoading}
                  onUpdate={onWhitelistedTokensCardUpdate}
                  edit={manageSplitter}
                  reset={resetTrigger}
                />
              </div>
              <div className="flex flex-col gap-4 w-[423px]">
                <ContractInfoCard
                  data={contractInfoCardData}
                  totalDistributionsData={contractTotalDistributionsData}
                  onUpdate={onContractInfoCardUpdate}
                  edit={manageSplitter}
                  reset={resetTrigger}
                />
                <ActivityCard data={contractTransactions} />
              </div>
            </div>
          </div>
        )}

        <RenderModal
          title={
            confirmModal[1] === "done"
              ? "You are about to lock your splitter."
              : "Are you sure you want to cancel your changes?"
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

export default NewSearch
