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

export interface IGetOwnedSplittersResponse {
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

  public async getOwnedSplitters(): Promise<IGetOwnedSplittersResponse[]> {
    return this.get(OWNED_SPLITTERS, {})
  }

  public async getTransactions({ address }: ITransactionRequest): Promise<any> {
    const res = await this.get(TRANSACTIONS, {
      address,
    })
    return res.transactions
  }
}

export default SplitterApiService
