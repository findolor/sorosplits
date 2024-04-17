import BaseApiService from "./Base"

const BASE_PATH = "diversifier"
const CALL_METHOD = `${BASE_PATH}/call`

interface ICallMethodRequest {
  transaction: string
}

class DiversifierApiService extends BaseApiService {
  constructor(accessToken: string) {
    super(accessToken)
  }

  public async callMethod({ transaction }: ICallMethodRequest): Promise<void> {
    return this.post(CALL_METHOD, { transaction })
  }
}

export default DiversifierApiService
