import { ShareDataProps } from "sorosplits-sdk/lib/contracts/Splitter"
import useContracts from "./useContracts"
import useApiService from "../useApi"
import { SplitterContractActivity } from "@/components/SplitterData/Activity"

const useSplitter = () => {
  const { splitterContract } = useContracts()
  const { contractApiService } = useApiService()

  const callContract = async (signature: string) => {
    await contractApiService.callMethod({
      transaction: signature,
      contractType: "splitter",
    })
  }

  const updateName = async (contractAddress: string, name: string) => {
    const signature = await splitterContract.signTransaction([
      splitterContract.getCallOperation({
        contractId: contractAddress,
        method: "update_name",
        args: {
          name,
        },
      }),
    ])
    await callContract(signature)
  }

  const updateShares = async (
    contractAddress: string,
    shares: ShareDataProps[]
  ) => {
    const signature = await splitterContract.signTransaction([
      splitterContract.getCallOperation({
        contractId: contractAddress,
        method: "update_shares",
        args: {
          shares,
        },
      }),
    ])
    await callContract(signature)
  }

  const lockContract = async (contractAddress: string) => {
    const signature = await splitterContract.signTransaction([
      splitterContract.getCallOperation({
        contractId: contractAddress,
        method: "lock_contract",
        args: {},
      }),
    ])
    await callContract(signature)
  }

  const updateWhitelistedTokens = async (
    contractAddress: string,
    tokens: string[]
  ) => {
    const signature = await splitterContract.signTransaction([
      splitterContract.getCallOperation({
        contractId: contractAddress,
        method: "update_whitelisted_tokens",
        args: {
          tokens,
        },
      }),
    ])
    await callContract(signature)
  }

  const distributeTokens = async (
    contractAddress: string,
    tokenAddress: string,
    amount: number
  ) => {
    const signature = await splitterContract.signTransaction([
      splitterContract.getCallOperation({
        contractId: contractAddress,
        method: "distribute_tokens",
        args: {
          tokenAddress,
          amount,
        },
      }),
    ])
    await callContract(signature)
  }

  const transferTokens = async (
    contractAddress: string,
    tokenAddress: string,
    recipient: string,
    amount: number
  ) => {
    const signature = await splitterContract.signTransaction([
      splitterContract.getCallOperation({
        contractId: contractAddress,
        method: "transfer_tokens",
        args: {
          tokenAddress,
          recipient,
          amount,
        },
      }),
    ])
    await callContract(signature)
  }

  const withdrawAllocation = async (
    contractAddress: string,
    tokenAddress: string,
    shareholder: string,
    amount: number
  ) => {
    const signature = await splitterContract.signTransaction([
      splitterContract.getCallOperation({
        contractId: contractAddress,
        method: "withdraw_allocation",
        args: {
          tokenAddress,
          shareholder,
          amount,
        },
      }),
    ])
    await callContract(signature)
  }

  const getConfig = async (contractAddress: string) => {
    return splitterContract.query({
      contractId: contractAddress,
      method: "get_config",
      args: {},
    })
  }

  const listShares = async (contractAddress: string) => {
    return splitterContract.query({
      contractId: contractAddress,
      method: "list_shares",
      args: {},
    })
  }

  const listWhitelistedTokens = async (contractAddress: string) => {
    return splitterContract.query({
      contractId: contractAddress,
      method: "list_whitelisted_tokens",
      args: {},
    })
  }

  const getAllocation = async (
    contractAddress: string,
    tokenAddress: string,
    shareholderAddress: string
  ) => {
    return splitterContract.query({
      contractId: contractAddress,
      method: "get_allocation",
      args: {
        tokenAddress,
        shareholderAddress,
      },
    })
  }

  const getUnusedTokens = async (
    contractAddress: string,
    tokenAddress: string
  ) => {
    return splitterContract.query({
      contractId: contractAddress,
      method: "get_unused_tokens",
      args: {
        tokenAddress,
      },
    })
  }

  const getActivity = async (
    contractAddress: string
  ): Promise<SplitterContractActivity[]> => {
    return contractApiService.getTransactions({
      address: contractAddress,
    })
  }

  const togglePin = async (contractAddress: string) => {
    return contractApiService.togglePin({
      address: contractAddress,
    })
  }

  const isPinned = async (contractAddress: string) => {
    return contractApiService.isPinned({
      address: contractAddress,
    })
  }

  return {
    call: {
      updateName,
      updateShares,
      lockContract,
      updateWhitelistedTokens,
      distributeTokens,
      transferTokens,
      withdrawAllocation,
    },
    query: {
      getConfig,
      listShares,
      listWhitelistedTokens,
      getAllocation,
      getUnusedTokens,
    },
    getActivity,
    togglePin,
    isPinned,
  }
}

export default useSplitter
