import BaseApiService from "./Base"

const BASE_PATH = "contract"
const CALL_METHOD = `${BASE_PATH}/call`
const OWNED_SPLITTERS = `${BASE_PATH}/my-contracts`
const TRANSACTIONS = `${BASE_PATH}/transactions`
const SWAP_PATH = `${BASE_PATH}/swap-path`

export interface ResponseProps {
  address: string
  name: string
  createdAt: string
}

interface ICallMethodRequest {
  transaction: string
  contractType: "splitter" | "diversifier"
}

interface ITransactionRequest {
  address: string
}

interface ISwapPathRequest {
  sourceTokenAddress: string
  destinationTokenAddress: string
  amount: string
}

class ContractApiService extends BaseApiService {
  constructor(accessToken: string) {
    super(accessToken)
  }

  public async callMethod({
    transaction,
    contractType,
  }: ICallMethodRequest): Promise<void> {
    return this.post(CALL_METHOD, { transaction, contractType })
  }

  public async getOwned(): Promise<ResponseProps[]> {
    return this.get(OWNED_SPLITTERS, {})
  }

  public async getTransactions({ address }: ITransactionRequest): Promise<any> {
    const res = await this.get(TRANSACTIONS, {
      address,
    })
    return res.transactions
  }

  public async getPinned(): Promise<ResponseProps[]> {
    return this.get(`${BASE_PATH}/pinned`, {})
  }

  public async togglePin({ address }: ITransactionRequest): Promise<void> {
    return this.post(`${BASE_PATH}/toggle-pin`, { address })
  }

  public async isPinned({ address }: ITransactionRequest): Promise<boolean> {
    const res = await this.get(`${BASE_PATH}/is-pinned`, { address })
    return res.pinned
  }

  public async getSwapPath({
    sourceTokenAddress,
    destinationTokenAddress,
    amount,
  }: ISwapPathRequest) {
    const res = await this.get(SWAP_PATH, {
      sourceTokenAddress,
      destinationTokenAddress,
      amount,
    })
    return res.swapPath
  }
}

export default ContractApiService
