import BaseApiService from "./Base"

const BASE_PATH = "splitter"
const CREATE_SPLITTER = `${BASE_PATH}/create`
const CALL_METHOD = `${BASE_PATH}/call`
const OWNED_SPLITTERS = `${BASE_PATH}/my-contracts`
const TRANSACTIONS = `${BASE_PATH}/transactions`

interface ICreateSplitterRequest {
  transaction: string
}

interface ICallMethodRequest {
  transaction: string
}

export interface SplitterResponseProps {
  address: string
  name: string
  createdAt: string
}

interface ITransactionRequest {
  address: string
}

class SplitterApiService extends BaseApiService {
  constructor(accessToken: string) {
    super(accessToken)
  }

  public async createSplitter({
    transaction,
  }: ICreateSplitterRequest): Promise<string> {
    const res = await this.post(CREATE_SPLITTER, { transaction })
    return res.contractAddress
  }

  public async callMethod({ transaction }: ICallMethodRequest): Promise<void> {
    return this.post(CALL_METHOD, { transaction })
  }

  public async getOwnedSplitters(): Promise<SplitterResponseProps[]> {
    return this.get(OWNED_SPLITTERS, {})
  }

  public async getTransactions({ address }: ITransactionRequest): Promise<any> {
    const res = await this.get(TRANSACTIONS, {
      address,
    })
    return res.transactions
  }

  public async getPinnedSplitters(): Promise<SplitterResponseProps[]> {
    return this.get(`${BASE_PATH}/pinned`, {})
  }

  public async togglePin({ address }: ITransactionRequest): Promise<void> {
    return this.post(`${BASE_PATH}/toggle-pin`, { address })
  }

  public async isPinned({ address }: ITransactionRequest): Promise<boolean> {
    const res = await this.get(`${BASE_PATH}/is-pinned`, { address })
    return res.pinned
  }
}

export default SplitterApiService
