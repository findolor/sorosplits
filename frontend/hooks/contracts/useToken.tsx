import useAppStore from "@/store/index"
import useApiService from "../useApi"
import useContracts from "./useContracts"

const useToken = () => {
  const { tokenContract } = useContracts()
  const { tokenApiService } = useApiService()
  const { tokenList } = useAppStore()

  const getName = (contractAddress: string) => {
    return tokenContract.query({
      contractId: contractAddress,
      method: "get_token_name",
      args: {},
    })
  }

  const getSymbol = (contractAddress: string) => {
    return tokenContract.query({
      contractId: contractAddress,
      method: "get_token_symbol",
      args: {},
    })
  }

  const getDecimal = (contractAddress: string) => {
    return tokenContract.query({
      contractId: contractAddress,
      method: "get_token_decimal",
      args: {},
    })
  }

  const getBalance = (contractAddress: string, id: string) => {
    return tokenContract.query({
      contractId: contractAddress,
      method: "get_token_balance",
      args: {
        id,
      },
    })
  }

  const getTokenDetails = async (tokenAddress: string) => {
    const token = tokenList.find((token) => token.network === "testnet")
    if (!token) throw new Error("Network not found")

    const details = token.assets.find(
      (asset) => asset.contract === tokenAddress
    )

    if (details) {
      return {
        name: details.name,
        symbol: details.code,
        decimals: details.decimals,
      }
    } else {
      const res = await Promise.all([
        getName(tokenAddress),
        getSymbol(tokenAddress),
        getDecimal(tokenAddress),
      ])

      if (!res) {
        throw new Error("Token query failed")
      }

      return {
        name: res[0] as string,
        symbol: res[1] as string,
        decimals: res[2] as number,
      }
    }
  }

  return {
    query: {
      getName,
      getSymbol,
      getDecimal,
      getBalance,
    },
    getTokenDetails,
  }
}

export default useToken
