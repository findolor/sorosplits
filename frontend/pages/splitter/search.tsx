import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"

import Search from "@/components/Input/Search"
import PageHeader from "@/components/PageHeader"
import { InputData } from "@/components/SplitterData"
import ContractInfoCard from "@/components/SplitterData/ContractInfo"
import ShareholdersCard from "@/components/SplitterData/Shareholders"
import {
  ContractConfigResult,
  ShareDataProps,
} from "@sorosplits/sdk/lib/contracts/Splitter"
import useAppStore from "@/store/index"
import useApiService from "@/hooks/useApi"
import { loadingToast, successToast, errorToast } from "@/utils/toast"
import useContracts from "@/hooks/useContracts"
import {
  ManageSplitterButton,
  ManageSplitterCancelButton,
  ManageSplitterDoneButton,
} from "@/components/Button/Splitter"
import WhitelistedTokensCard from "@/components/SplitterData/WhitelistedTokens"
import ActivityCard, {
  SplitterContractActivity,
} from "@/components/SplitterData/Activity"
import ConfirmationModal from "@/components/Modal"

const NewSearch: React.FC = () => {
  const router = useRouter()
  const { loading, setLoading, walletAddress } = useAppStore()
  const { splitterApiService } = useApiService()
  const { splitterContract } = useContracts()

  const [contractAddress, setContractAddress] = useState("")
  const [contractConfig, setContractConfig] = useState<ContractConfigResult>()
  const [contractShares, setContractShares] = useState<InputData[]>()
  const [contractTransactions, setContractTransactions] = useState<
    SplitterContractActivity[]
  >([])
  const [manageSplitter, setManageSplitter] = useState(false)
  const [confirmModal, setConfirmModal] = useState<[boolean, string]>([
    false,
    "",
  ])

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
    setConfirmModal([true, "done"])
  }

  const manageSplitterCancelOnClick = () => {
    setConfirmModal([true, "cancel"])
  }

  useEffect(() => {
    const fetchContractData = setTimeout(async () => {
      try {
        if (contractAddress === "") {
          setContractConfig(undefined)
          setContractShares(undefined)
          return
        }

        loadingToast("Searching for Splitter contract...")

        let results = await Promise.all([
          splitterContract.query({
            contractId: contractAddress,
            method: "get_config",
            args: {},
          }),
          splitterContract.query({
            contractId: contractAddress,
            method: "list_shares",
            args: {},
          }),
        ]).catch((error) => {
          throw new Error(error)
        })

        if (results) {
          successToast("Found Splitter contract!")

          let config = results[0] as ContractConfigResult
          setContractConfig(config)

          let shares = results[1] as ShareDataProps[]
          let shareData = shares.map((item) => {
            return {
              input: item.shareholder.toString(),
              shareData: {
                shareholder: item.shareholder.toString(),
                share: Number(BigInt(item.share)) / 100,
              },
            }
          })
          setContractShares(shareData)
        }
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
      const data = await splitterApiService.getTransactions({
        address: contractAddress,
      })
      setContractTransactions(data)
    }

    if (contractShares && contractConfig) {
      fetch()
    }
  }, [contractShares, contractConfig])

  const shareholdersCardData = useMemo(() => {
    if (!contractShares) return []
    return contractShares.map((i) => {
      return {
        address: i.shareData.shareholder.toString(),
        share: i.shareData.share.toString(),
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
        balances: [],
        totalDistributions: [],
      }
    return {
      owner: contractConfig.admin.toString(),
      name: new TextDecoder().decode(contractConfig.name).toString(),
      updatable: contractConfig.updatable,
      balances: [],
      totalDistributions: [],
    }
  }, [contractConfig])

  const cancelTransaction = async () => {
    setManageSplitter(false)
    setConfirmModal([false, ""])
  }

  const submitTransaction = async () => {}

  return (
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
          {walletAddress === contractConfig.admin.toString() && (
            <div className="flex items-center justify-between mb-2">
              <div>
                {manageSplitter ? (
                  <ManageSplitterDoneButton
                    onClick={manageSplitterDoneOnClick}
                  />
                ) : (
                  <ManageSplitterButton onClick={manageSplitterOnClick} />
                )}
              </div>
              {manageSplitter && (
                <ManageSplitterCancelButton
                  onClick={manageSplitterCancelOnClick}
                />
              )}
            </div>
          )}

          <div className="flex justify-between">
            <div className="flex flex-col gap-4">
              <ShareholdersCard
                data={shareholdersCardData}
                edit={manageSplitter}
              />
              <WhitelistedTokensCard
                data={[
                  {
                    name: "Ethereum",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  {
                    name: "Stellar",
                    symbol: "XLM",
                    decimals: 7,
                  },
                  {
                    name: "Test Network",
                    symbol: "SPLT",
                    decimals: 9,
                  },
                ]}
              />
            </div>
            <div className="flex flex-col gap-4">
              <ContractInfoCard
                data={contractInfoCardData}
                edit={manageSplitter}
              />
              <ActivityCard data={contractTransactions} />
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
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
        isOpen={confirmModal[0]}
        onCancel={() => setConfirmModal([false, ""])}
        onConfirm={submitTransaction}
      />
    </div>
  )
}

export default NewSearch
