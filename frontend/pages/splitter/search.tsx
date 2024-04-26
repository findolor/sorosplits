import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import Search from "@/components/Input/Search"
import PageHeader from "@/components/PageHeader"
import ContractInfoCard from "@/components/SplitterData/ContractInfo"
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
import useSplitter from "@/hooks/contracts/useSplitter"
import useToken from "@/hooks/contracts/useToken"
import useModal from "@/hooks/modals/useConfirmation"
import Layout from "@/components/Layout"
import Loading from "@/components/Loading"
import useDiversifier from "@/hooks/contracts/useDiversifier"
import TokenBalancesCard from "@/components/SplitterData/TokenBalancesCard"
import WhitelistedSwapTokensCard, {
  WhitelistedSwapTokensCardData,
} from "@/components/SplitterData/WhitelistedSwapTokens"

const NewSearch: React.FC = () => {
  const router = useRouter()
  const splitter = useSplitter()
  const diversifier = useDiversifier()
  const token = useToken()
  const { walletAddress, setLoading, isConnected } = useAppStore()
  const { confirmModal, onConfirmModal, onCancelModal, RenderModal } =
    useModal()

  const [searchAddress, setSearchAddress] = useState("")
  const [diversifierContractAddress, setDiversifierContractAddress] =
    useState("")
  const [splitterContractAddress, setSplitterContractAddress] = useState("")

  // Initial state for contract data
  // Comes from the contract itself
  const [contractOwner, setContractOwner] = useState("")
  const [contractIsDiversifierActive, setContractIsDiversifierActive] =
    useState(false)
  const [contractConfig, setContractConfig] = useState<ContractConfigResult>()
  const [contractShares, setContractShares] = useState<ShareDataProps[]>()
  const [contractWhitelistedTokens, setContractWhitelistedTokens] = useState<
    string[]
  >([])
  const [contractWhitelistedSwapTokens, setContractWhitelistedSwapTokens] =
    useState<string[][]>([])
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
  const [whitelistedSwapTokensOG, setWhitelistedSwapTokensOG] = useState<
    WhitelistedSwapTokensCardData[]
  >([])
  const [whitelistedSwapTokensCardData, setWhitelistedSwapTokensCardData] =
    useState<WhitelistedSwapTokensCardData[]>([])
  const [
    whitelistedSwapTokensCardDataLoading,
    setWhitelistedSwapTokensCardDataLoading,
  ] = useState(true)

  // Updated state for contract data
  const [updatedContractName, setUpdatedContractName] = useState("")
  const [updatedContractUpdatable, setUpdatedContractUpdatable] = useState(true)
  const [
    updatedContractIsDiversifierActive,
    setUpdatedContractIsDiversifierActive,
  ] = useState(false)
  const [updatedContractShares, setUpdatedContractShares] = useState<
    ShareDataProps[]
  >([])
  const [
    updatedContractWhitelistedTokens,
    setUpdatedContractWhitelistedTokens,
  ] = useState<string[]>([])
  const [
    updatedContractWhitelistedSwapTokens,
    setUpdatedContractWhitelistedSwapTokens,
  ] = useState<string[][]>([])

  // UI state
  const [manageSplitter, setManageSplitter] = useState(false)
  const [resetTrigger, setResetTrigger] = useState(0)

  // TODO: Get this from api
  const [[isPinned, isPinnedLoading], setIsPinned] = useState([false, true])

  useEffect(() => {
    if (router.query.address) {
      setSearchAddress(router.query.address as string)
    }
  }, [router.query])

  useEffect(() => {
    if (searchAddress != "") {
      router.push(
        {
          pathname: router.pathname,
          query: { address: searchAddress },
        },
        undefined,
        { shallow: true }
      )
    }
  }, [searchAddress])

  const onSearchAddressChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchAddress(event.target.value)
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

  const contractAddress = useMemo(() => {
    return diversifierContractAddress || splitterContractAddress
  }, [diversifierContractAddress, splitterContractAddress])

  useEffect(() => {
    const fetchContractData = setTimeout(async () => {
      try {
        resetContractData()
        if (searchAddress === "") return
        setDiversifierContractAddress(searchAddress)

        loadingToast("Searching for contract...")

        const diversifierConfig = await diversifier.query.getDiversifierConfig(
          searchAddress
        )

        setContractOwner(diversifierConfig.admin)
        setContractIsDiversifierActive(diversifierConfig.diversifier_active)
        setUpdatedContractIsDiversifierActive(
          diversifierConfig.diversifier_active
        )

        const splitterAddress = diversifierConfig.splitter_address.toString()
        setSplitterContractAddress(splitterAddress)

        const config = await splitter.query.getConfig(splitterAddress)
        setContractConfig(config)
        setUpdatedContractName(new TextDecoder().decode(config.name).toString())
        setUpdatedContractUpdatable(config.updatable)

        const shares = await splitter.query.listShares(splitterAddress)
        let shareData = shares.map((item) => {
          return {
            shareholder: item.shareholder.toString(),
            share: Number(BigInt(item.share)) / 100,
          }
        })
        setContractShares(shareData)
        setUpdatedContractShares(shareData)

        const whitelistedTokens = await splitter.query.listWhitelistedTokens(
          splitterAddress
        )
        setContractWhitelistedTokens(whitelistedTokens)
        setUpdatedContractWhitelistedTokens(whitelistedTokens)

        const swapTokensRes = await Promise.all(
          whitelistedTokens.map((address) =>
            diversifier.query.listWhiteListedSwapTokens(searchAddress, address)
          )
        )
        setContractWhitelistedSwapTokens(swapTokensRes)

        successToast("Contract found!")
      } catch (error: any) {
        resetContractData()
        errorToast(error)
      }
    }, 1000)

    return () => clearTimeout(fetchContractData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchAddress])

  const resetContractData = () => {
    setContractConfig(undefined)
    setContractShares(undefined)
    setContractIsDiversifierActive(false)
    setContractWhitelistedTokens([])
    setWhitelistedTokensCardData([])
    setWhitelistedTokensCardDataLoading(true)
    setWhitelistedSwapTokensCardData([])
    setWhitelistedSwapTokensCardDataLoading(true)
    setContractTransactions([])
  }

  useEffect(() => {
    const fetch = async () => {
      const data = await splitter.getActivity(contractAddress)
      setContractTransactions(data)
    }

    if (contractShares && contractConfig && contractWhitelistedTokens) {
      fetch()
    }
  }, [
    contractShares,
    contractConfig,
    contractWhitelistedTokens,
    contractIsDiversifierActive,
  ])

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
        isDiversifierActive: false,
      }
    return {
      owner: contractOwner,
      name: new TextDecoder().decode(contractConfig.name).toString(),
      updatable: contractConfig.updatable,
      isDiversifierActive: contractIsDiversifierActive,
    }
  }, [contractIsDiversifierActive, contractConfig])

  useEffect(() => {
    const fetch = async () => {
      if (contractAddress === "" || contractWhitelistedTokens.length === 0) {
        setWhitelistedTokensCardDataLoading(false)
        return
      }

      setWhitelistedTokensCardDataLoading(true)

      const tokenDataPromises = contractWhitelistedTokens.map(
        async (tokenAddress) => {
          const details = await token.getTokenDetails(tokenAddress)
          return {
            address: tokenAddress,
            name: details.name,
            symbol: details.symbol,
            decimals: details.decimals,
          }
        }
      )
      const whitelistedTokensCardData = await Promise.all(tokenDataPromises)

      setWhitelistedTokensCardData(whitelistedTokensCardData)
      setWhitelistedTokensCardDataLoading(false)
    }

    fetch()
  }, [contractAddress, contractWhitelistedTokens])

  useEffect(() => {
    const fetch = async () => {
      if (contractAddress === "" || whitelistedTokensCardData.length === 0) {
        setWhitelistedSwapTokensCardDataLoading(false)
        return
      }

      setWhitelistedSwapTokensCardDataLoading(true)

      const swapTokensDataPromises = contractWhitelistedSwapTokens.map(
        async (item) => {
          let response = []
          for (let tokenAddress of item) {
            const [name, symbol, decimals] = await Promise.all([
              token.query.getName(tokenAddress),
              token.query.getSymbol(tokenAddress),
              token.query.getDecimal(tokenAddress),
            ])

            response.push({
              address: tokenAddress,
              name,
              symbol,
              decimals,
            })
          }
          return response
        }
      )
      const response = await Promise.all(swapTokensDataPromises)

      let whitelistedSwapTokensCardData = whitelistedTokensCardData.map(
        (item, index) => {
          return {
            token: item,
            swapTokens: response[index],
          }
        }
      )
      setWhitelistedSwapTokensCardData(whitelistedSwapTokensCardData)
      setWhitelistedSwapTokensOG(whitelistedSwapTokensCardData)
      setWhitelistedSwapTokensCardDataLoading(false)
    }

    fetch()
  }, [contractAddress, whitelistedTokensCardData])

  const onConfirm = async () => {
    if (confirmModal[1] === "cancel") {
      setResetTrigger((prev) => prev + 1)
      setWhitelistedSwapTokensCardData(whitelistedSwapTokensOG)
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
    const isDiversifierActiveUpdated =
      updatedContractIsDiversifierActive != contractIsDiversifierActive
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
      isDiversifierActive: isDiversifierActiveUpdated,
      shares: sharesUpdated,
      whitelistedTokens: whitelistedTokensUpdated,
    }
  }

  const updateSplitter = async () => {
    loadingToast("Updating your contract...")

    try {
      setLoading(true)

      const updates = checkUpdates()
      if (
        !updates.name &&
        !updates.updatable &&
        !updates.isDiversifierActive &&
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
      if (updates.isDiversifierActive) {
        await diversifier.call.toggleDiversifier(contractAddress)
        setContractIsDiversifierActive(updatedContractIsDiversifierActive)
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
      successToast("Contract updated successfully!")
      onCancelModal()
    } catch (error: any) {
      setLoading(false)
      errorToast(error)
    }
  }

  const onContractInfoCardUpdate = (
    name: string,
    updatable: boolean,
    isDiversifierActive: boolean
  ) => {
    setUpdatedContractName(name)
    setUpdatedContractUpdatable(updatable)
    setUpdatedContractIsDiversifierActive(isDiversifierActive)
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
    setWhitelistedSwapTokensCardData(
      data.map((i) => ({
        token: i,
        swapTokens:
          whitelistedSwapTokensOG.find((j) => j.token.address === i.address)
            ?.swapTokens || [],
      }))
    )
  }

  const onWhitelistedSwapTokensCardUpdate = (
    data: WhitelistedSwapTokensCardData[]
  ) => {
    setUpdatedContractWhitelistedSwapTokens(
      data.map((i) => i.swapTokens.map((j) => j.address))
    )
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
          title="Search Contract"
          subtitle="Display information about a contract by entering the address below."
        />

        <div className="flex justify-center mt-10">
          <Search
            placeholder="Enter contract address"
            onChange={onSearchAddressChange}
            value={searchAddress}
          />
        </div>

        {/* <div className="flex w-full justify-center mt-10">
          TODO: Write contract address to send funds to
        </div> */}

        {contractConfig && contractShares && (
          <div className="flex flex-col justify-between mt-6 px-3">
            {isConnected && (
              <div className="flex items-center justify-between mb-2">
                {walletAddress === contractOwner.toString() && (
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

            <div className="flex justify-between gap-4">
              <div className="flex flex-col gap-4 w-full">
                <ShareholdersCard
                  data={shareholdersCardData}
                  onUpdate={onShareholderCardUpdate}
                  edit={manageSplitter}
                  reset={resetTrigger}
                />
                <WhitelistedTokensCard
                  data={whitelistedTokensCardData}
                  dataLoading={whitelistedTokensCardDataLoading}
                  onUpdate={onWhitelistedTokensCardUpdate}
                  edit={manageSplitter}
                />
                {!contractIsDiversifierActive && (
                  <WhitelistedSwapTokensCard
                    data={whitelistedSwapTokensCardData}
                    dataLoading={whitelistedSwapTokensCardDataLoading}
                    onUpdate={onWhitelistedSwapTokensCardUpdate}
                    edit={manageSplitter}
                  />
                )}
              </div>
              <div className="flex flex-col gap-4 w-full">
                <ContractInfoCard
                  data={contractInfoCardData}
                  onUpdate={onContractInfoCardUpdate}
                  edit={manageSplitter}
                  reset={resetTrigger}
                />
                <TokenBalancesCard
                  data={whitelistedTokensCardData}
                  isDiversifierActive={contractIsDiversifierActive}
                  diversifierContractAddress={diversifierContractAddress}
                  splitterContractAddress={splitterContractAddress}
                />
                <ActivityCard data={contractTransactions} />
              </div>
            </div>
          </div>
        )}

        <RenderModal
          title={
            confirmModal[1] === "done"
              ? "You are about to lock your configuration."
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
