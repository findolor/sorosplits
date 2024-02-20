import useWallet from "../useWallet"
import { useEffect, useState } from "react"
import SplitterContract, {
  CallContractArgs,
  CallMethod,
  DeployAndInitContractArgs,
  QueryContractArgs,
  QueryContractResult,
  QueryMethod,
} from "../../contracts/Splitter"

const useSplitterContract = () => {
  const { isConnected, walletAddress } = useWallet()

  const [splitterContract, setSplitterContract] = useState<SplitterContract>(
    new SplitterContract("")
  )

  useEffect(() => {
    const splitterContract = new SplitterContract(walletAddress || "")
    setSplitterContract(splitterContract)
  }, [walletAddress])

  const checkFreighterConnection = async () => {
    if (!isConnected) {
      throw new Error("Freighter not connected")
    }
  }

  const deployAndInit = async ({
    shares,
    mutable,
  }: DeployAndInitContractArgs) => {
    await checkFreighterConnection()
    return splitterContract.deployAndInit({ shares, mutable })
  }

  const query = async <T extends QueryMethod>({
    contractId,
    method,
    args,
  }: QueryContractArgs<T>): Promise<QueryContractResult<T>> => {
    await checkFreighterConnection()
    return splitterContract.query({ contractId, method, args })
  }

  const call = async <T extends CallMethod>({
    contractId,
    method,
    args,
  }: CallContractArgs<T>) => {
    await checkFreighterConnection()
    return splitterContract.call({ contractId, method, args })
  }

  return {
    deployAndInit,
    query,
    call,
  }
}

export default useSplitterContract
