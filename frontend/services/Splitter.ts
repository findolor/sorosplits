import BaseApiService from "./Base"

const BASE_PATH = "splitter"
const CREATE_SPLITTER = `${BASE_PATH}/create`
const CALL_METHOD = `${BASE_PATH}/call`
const OWNED_SPLITTERS = `${BASE_PATH}/my-contracts`

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
}

export default SplitterApiService
