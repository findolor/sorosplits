import { useState } from "react"
import Button from "../../components/Button"
import SplitterData, {
  DataProps,
  INITIAL_DATA,
} from "../../components/SplitterData"
import PageHeader from "../../components/PageHeader"
import Switch from "../../components/Switch"
import { useRouter } from "next/router"
import checkSplitterData from "../../utils/checkSplitterData"
import { errorToast, loadingToast, successToast } from "../../utils/toast"
import useAppStore from "../../store"
import useSplitterContract from "../../hooks/contracts/useSplitter"

export default function SetupSplitter() {
  const { push } = useRouter()
  const splitterContract = useSplitterContract()
  const { loading, setLoading } = useAppStore()

  const [data, setData] = useState<DataProps[]>(INITIAL_DATA)
  const [mutable, setMutable] = useState<boolean>(false)

  const deployAndInitSplitter = async () => {
    try {
      setLoading(true)

      checkSplitterData(data)

      loadingToast("Creating your Splitter contract...")

      let contractId = await splitterContract.deployAndInit({
        shares: data.map((item) => {
          return {
            ...item,
            share: item.share * 100,
          }
        }),
        mutable,
      })

      successToast(
        "Splitter contract initialized successfully! Navigating to contract page..."
      )

      setTimeout(() => {
        setLoading(false)
        push(`/splitter/search?contractId=${contractId}`)
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
          onChange={setMutable}
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
