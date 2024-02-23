import { useEffect, useState } from "react"
import TokenContract, {
  QueryContractArgs,
  QueryContractResult,
  QueryMethod,
} from "../../contracts/Token"
import { Network } from "../../config"
import { checkFreighterConnection } from "../helper"

export const useTokenContract = (network: string, walletAddress: string) => {
  const [tokenContract, setTokenContract] = useState<TokenContract>(
    new TokenContract(network as Network, walletAddress)
  )

  useEffect(() => {
    const tokenContract = new TokenContract(network as Network, walletAddress)
    setTokenContract(tokenContract)
  }, [walletAddress])

  const query = async <T extends QueryMethod>({
    contractId,
    method,
    args,
  }: QueryContractArgs<T>): Promise<QueryContractResult<T>> => {
    await checkFreighterConnection()
    return tokenContract.query({ contractId, method, args })
  }

  return {
    query,
  }
}
