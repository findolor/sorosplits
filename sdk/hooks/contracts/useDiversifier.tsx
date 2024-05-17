import { useEffect, useState } from "react"
import { Network } from "../../config"
import {
  DiversifierContract,
  CallContractArgs,
  CallMethod,
  QueryContractArgs,
  QueryContractResult,
  QueryMethod,
} from "../../contracts/Diversifier"
import { checkFreighterConnection } from "../helper"

export const useDiversifierContract = (
  network: Network,
  walletAddress: string
) => {
  const [diversifierContract, setDiversifierContract] =
    useState<DiversifierContract>(
      new DiversifierContract(network, walletAddress)
    )

  useEffect(() => {
    const diversifierContract = new DiversifierContract(network, walletAddress)
    setDiversifierContract(diversifierContract)
  }, [walletAddress])

  const query = async <T extends QueryMethod>({
    contractId,
    method,
    args,
  }: QueryContractArgs<T>): Promise<QueryContractResult<T>> => {
    await checkFreighterConnection()
    return diversifierContract.query({ contractId, method, args })
  }

  const call = async <T extends CallMethod>({
    contractId,
    method,
    args,
  }: CallContractArgs<T>) => {
    await checkFreighterConnection()
    return diversifierContract.call({ contractId, method, args })
  }

  return {
    query,
    call,
  }
}
