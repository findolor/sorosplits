import useWallet from "../useWallet"
import { useEffect, useState } from "react"
import TokenContract, { QueryContractArgs, QueryContractResult, QueryMethod } from "../../contracts/Token"

const useTokenContract = () => {
  const { isConnected, walletAddress } = useWallet()

  const [tokenContract, setTokenContract] = useState<TokenContract>(
    new TokenContract("")
  )

  useEffect(() => {
    const tokenContract = new TokenContract(walletAddress || "")
    setTokenContract(tokenContract)
  }, [walletAddress])

  const checkFreighterConnection = async () => {
    if (!isConnected) {
      throw new Error("Freighter not connected")
    }
  }

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

export default useTokenContract
