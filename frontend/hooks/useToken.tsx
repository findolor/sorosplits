import useContracts from "./useContracts"

const useToken = () => {
  const { tokenContract } = useContracts()

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

  return {
    query: {
      getName,
      getSymbol,
      getDecimal,
      getBalance,
    },
  }
}

export default useToken
