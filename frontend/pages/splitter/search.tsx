import { useEffect, useState } from "react"
import Input from "../../components/Input"
import useSplitterContract from "../../hooks/contracts/useSplitter"
import { loadingToast, successToast, errorToast } from "../../utils/toast"
import SplitterData, { DataProps } from "../../components/SplitterData"
import Button from "../../components/Button"
import Link from "next/link"
import { TbExternalLink } from "react-icons/tb"
import PageHeader from "../../components/PageHeader"
import { useRouter } from "next/router"
import checkSplitterData from "../../utils/checkSplitterData"
import { Address } from "stellar-sdk"
import useAppStore from "../../store"
import TokenDistribution from "../../components/TokenDistribution"
import { ContractConfigResult } from "../../contracts/Splitter"

export default function SearchSplitter() {
  const { query } = useRouter()
  const { loading, setLoading } = useAppStore()
  const splitterContract = useSplitterContract()

  const [contractAddress, setContractAddress] = useState("")

  const [contractConfig, setContractConfig] = useState<ContractConfigResult>()
  const [contractShares, setContractShares] = useState<DataProps[]>()

  useEffect(() => {
    if (query.contractId) {
      setContractAddress(query.contractId as string)
    }
  }, [query])

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

          let shares = results[1] as DataProps[]
          let shareData = shares.map((item) => {
            return {
              shareholder: item.shareholder.toString(),
              share: Number(BigInt(item.share)) / 100,
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

      await splitterContract.call({
        contractId: contractAddress,
        method: "lock_contract",
        args: {},
      })

      setLoading(false)
      successToast("Splitter locked!")

      setContractConfig(Object.assign({}, contractConfig, { mutable: false }))
    } catch (error: any) {
      setLoading(false)
      errorToast(error)
    }
  }

  const updateSplitter = async () => {
    try {
      setLoading(true)

      if (!contractShares) return
      checkSplitterData(contractShares)

      loadingToast("Updating Splitter shareholders and shares...")

      const shares = contractShares.map((item) => {
        return {
          shareholder: Address.fromString(item.shareholder),
          share: BigInt(item.share * 100),
        }
      })

      await splitterContract.call({
        contractId: contractAddress,
        method: "update_shares",
        args: {
          shares,
        },
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
            {contractConfig.mutable ? (
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
              locked={loading || !contractConfig?.mutable}
            />

            <div className="h-8" />
            <Button
              text="Update Splitter"
              onClick={updateSplitter}
              type="primary"
              loading={loading || !contractConfig?.mutable}
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
