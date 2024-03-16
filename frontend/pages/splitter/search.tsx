import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import SoroSplitsSDK from "@sorosplits/sdk"
import {
  ContractConfigResult,
  ShareDataProps,
} from "@sorosplits/sdk/lib/contracts/Splitter"
import { TbExternalLink } from "react-icons/tb"
import Input from "@/components/Input"
import SplitterData, { InputData } from "@/components/SplitterData"
import Button from "@/components/Button"
import PageHeader from "@/components/PageHeader"
import TokenDistribution from "@/components/TokenDistribution"
import { loadingToast, successToast, errorToast } from "@/utils/toast"
import checkSplitterData from "@/utils/checkSplitterData"
import useAppStore from "@/store/index"
import useApiService from "@/hooks/useApi"

export default function SearchSplitter() {
  const router = useRouter()
  const { loading, setLoading, walletAddress } = useAppStore()
  const { splitterApiService } = useApiService()

  const [contractAddress, setContractAddress] = useState("")

  const [contractConfig, setContractConfig] = useState<ContractConfigResult>()
  const [contractShares, setContractShares] = useState<InputData[]>()

  const splitterContract = useMemo(() => {
    return new SoroSplitsSDK.SplitterContract("testnet", walletAddress || "")
  }, [walletAddress])

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

  const lockSplitter = async () => {
    try {
      setLoading(true)

      loadingToast("Locking Splitter for updates...")

      let operation = splitterContract.getCallOperation({
        contractId: contractAddress,
        method: "lock_contract",
        args: {},
      })
      const signedTx = await splitterContract.signTransaction(operation)

      await splitterApiService.callMethod({
        transaction: signedTx,
      })

      setLoading(false)
      successToast("Splitter locked!")

      setContractConfig(Object.assign({}, contractConfig, { updatable: false }))
    } catch (error: any) {
      setLoading(false)
      errorToast(error)
    }
  }

  const updateSplitter = async () => {
    try {
      setLoading(true)

      if (!contractShares) return
      checkSplitterData(contractShares.map((item) => item.shareData))

      loadingToast("Updating Splitter shareholders and shares...")

      let operation = splitterContract.getCallOperation({
        contractId: contractAddress,
        method: "update_shares",
        args: {
          shares: contractShares.map((item) => {
            return {
              ...item.shareData,
              share: item.shareData.share * 100,
            }
          }),
        },
      })
      const signedTx = await splitterContract.signTransaction(operation)

      await splitterApiService.callMethod({
        transaction: signedTx,
      })

      setLoading(false)
      successToast("Shareholders and shares updated successfully!")
    } catch (error: any) {
      setLoading(false)
      errorToast(error)
    }
  }

  return (
    <div className="flex flex-col w-full">
      <PageHeader
        title="Search Splitter"
        subtitle="Search for a Splitter contract by entering the contract address below."
      />

      <div className="flex mb-6">
        <Input
          placeholder="Enter Splitter address"
          onChange={setContractAddress}
          value={contractAddress}
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-6">
        {contractConfig && (
          <div>
            <h3 className="text-xl font-bold mb-2">Contract Admin</h3>
            <Link
              href={`https://futurenet.stellarchain.io/accounts/${contractConfig.admin.toString()}`}
              target="_blank"
              className="flex items-center gap-2 underline hover:text-accent"
            >
              {contractConfig.admin.toString()}
              <TbExternalLink size={16} />
            </Link>
          </div>
        )}

        {contractConfig && (
          <div>
            <h3 className="text-xl font-bold mb-2">Contract State</h3>
            {contractConfig.updatable ? (
              <>
                <p className="mb-4">
                  Contract is mutable. Shareholders and shares can be updated.
                </p>
                <Button
                  text="Lock Splitter"
                  onClick={lockSplitter}
                  type="primary"
                  loading={loading}
                />
              </>
            ) : (
              <p>
                Contract is immutable. Shareholders and shares are locked for
                updates.
              </p>
            )}
          </div>
        )}

        {contractShares && (
          <div>
            <h3 className="text-xl font-bold mb-2">Shareholders & Shares</h3>

            <SplitterData
              initialData={contractShares}
              updateData={setContractShares}
              locked={loading || !contractConfig?.updatable}
            />

            <div className="h-8" />
            <Button
              text="Update Splitter"
              onClick={updateSplitter}
              type="primary"
              loading={loading || !contractConfig?.updatable}
            />
          </div>
        )}

        {contractConfig && (
          <TokenDistribution
            splitterContractAddress={contractAddress}
            contractShares={contractShares || []}
          />
        )}
      </div>
    </div>
  )
}
