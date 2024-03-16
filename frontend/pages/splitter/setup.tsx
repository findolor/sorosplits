import { useState } from "react"
import { useRouter } from "next/router"
import Button from "@/components/Button"
import SplitterData, {
  INITIAL_DATA,
  InputData,
} from "@/components/SplitterData"
import PageHeader from "@/components/PageHeader"
import Switch from "@/components/Switch"
import useApiService from "@/hooks/useApi"
import useContracts from "@/hooks/useContracts"
import useAppStore from "@/store/index"
import checkSplitterData from "@/utils/checkSplitterData"
import { errorToast, loadingToast, successToast } from "@/utils/toast"

export default function SetupSplitter() {
  const { push } = useRouter()
  const { loading, setLoading } = useAppStore()
  const { splitterApiService } = useApiService()
  const { splitterContract } = useContracts()

  const [name, setName] = useState<string>("Splitter Contract")
  const [data, setData] = useState<InputData[]>(INITIAL_DATA)
  const [updatable, setUpdatable] = useState<boolean>(false)

  const deployAndInitSplitter = async () => {
    try {
      setLoading(true)

      checkSplitterData(data.map((item) => item.shareData))

      loadingToast("Creating your Splitter contract...")

      let operation = splitterContract.getDeployAndInitOperation({
        name,
        shares: data.map((item) => {
          return {
            ...item.shareData,
            share: item.shareData.share * 100,
          }
        }),
        updatable,
      })
      const signedTx = await splitterContract.signTransaction(operation)

      const contractAddress = await splitterApiService.createSplitter({
        transaction: signedTx,
      })

      successToast(
        "Splitter contract initialized successfully! Navigating to contract page..."
      )

      setTimeout(() => {
        setLoading(false)
        push(`/splitter/search?address=${contractAddress}`)
      }, 2000)
    } catch (error: any) {
      setLoading(false)
      errorToast(error)
    }
  }

  return (
    <div className="flex flex-col w-full">
      <PageHeader
        title="Setup Splitter"
        subtitle="Enter addresses and their shares to setup your splitter."
      />

      <div className="flex flex-col gap-8">
        <SplitterData
          initialData={data}
          updateData={setData}
          locked={loading}
        />

        <Switch
          initialState={false}
          onChange={setUpdatable}
          text="Allow updating shareholders and shares in the future?"
          locked={loading}
        />

        <Button
          text="Create Splitter"
          onClick={deployAndInitSplitter}
          type="primary"
          loading={loading}
        />
      </div>
    </div>
  )
}
