import { useEffect, useState } from "react"
import { Network } from "../../config"
import SplitterContract, {
  CallContractArgs,
  CallMethod,
  DeployAndInitContractArgs,
  QueryContractArgs,
  QueryContractResult,
  QueryMethod,
} from "../../contracts/Splitter"
import { checkFreighterConnection } from "../helper"

export const useSplitterContract = (
  network: Network,
  walletAddress: string
) => {
  const [splitterContract, setSplitterContract] = useState<SplitterContract>(
    new SplitterContract(network, walletAddress)
  )

  useEffect(() => {
    const splitterContract = new SplitterContract(network, walletAddress)
    setSplitterContract(splitterContract)
  }, [walletAddress])

  const deployAndInit = async ({
    name,
    shares,
    updatable,
  }: DeployAndInitContractArgs) => {
    await checkFreighterConnection()
    return splitterContract.deployAndInit({ name, shares, updatable })
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
