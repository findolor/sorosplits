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
import { ManageSplitterButton } from "@/components/Button/Splitter"

const NewSearch: React.FC = () => {
  const router = useRouter()
  const { loading, setLoading, walletAddress } = useAppStore()
  const { splitterApiService } = useApiService()
  const { splitterContract } = useContracts()

  const [contractAddress, setContractAddress] = useState("")
  const [contractConfig, setContractConfig] = useState<ContractConfigResult>()
  const [contractShares, setContractShares] = useState<InputData[]>()

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
            <div className="mb-2">
              <ManageSplitterButton onClick={() => {}} />
            </div>
          )}

          <div className="flex justify-between">
            <ShareholdersCard data={shareholdersCardData} />
            <ContractInfoCard data={contractInfoCardData} />
          </div>
        </div>
      )}
    </div>
  )
}

export default NewSearch
