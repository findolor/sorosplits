import useContracts from "./useContracts"
import useApiService from "../useApi"

const useDiversifier = () => {
  const { diversifierContract } = useContracts()
  const { contractApiService } = useApiService()

  const callContract = async (signature: string) => {
    await contractApiService.callMethod({
      transaction: signature,
      contractType: "diversifier",
    })
  }

  const updateWhitelistedSwapTokens = async (
    contractId: string,
    tokenAddress: string,
    swapTokens: string[]
  ) => {
    const signature = await diversifierContract.signTransaction([
      diversifierContract.getCallOperation({
        contractId,
        method: "update_whitelisted_swap_tokens",
        args: {
          tokenAddress,
          swapTokens,
        },
      }),
    ])
    await callContract(signature)
  }

  const swapAndDistributeTokens = async (
    contractId: string,
    swapPath: string[],
    amount: number
  ) => {
    const signature = await diversifierContract.signTransaction([
      diversifierContract.getCallOperation({
        contractId,
        method: "swap_and_distribute_tokens",
        args: {
          swapPath,
          amount,
        },
      }),
    ])
    await callContract(signature)
  }

  const toggleDiversifier = async (contractId: string) => {
    const signature = await diversifierContract.signTransaction([
      diversifierContract.getCallOperation({
        contractId,
        method: "toggle_diversifier",
        args: {},
      }),
    ])
    await callContract(signature)
  }

  const getDiversifierConfig = async (contractId: string) => {
    return diversifierContract.query({
      contractId,
      method: "get_diversifier_config",
      args: {},
    })
  }

  const listWhiteListedSwapTokens = async (
    contractId: string,
    tokenAddress: string
  ) => {
    return diversifierContract.query({
      contractId,
      method: "list_whitelisted_swap_tokens",
      args: {
        tokenAddress,
      },
    })
  }

  return {
    call: {
      updateWhitelistedSwapTokens,
      swapAndDistributeTokens,
      toggleDiversifier,
    },
    query: {
      getDiversifierConfig,
      listWhiteListedSwapTokens,
    },
  }
}

export default useDiversifier
