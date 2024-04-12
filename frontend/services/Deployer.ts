import BaseApiService from "./Base"

const BASE_PATH = "deployer"
const DEPLOY_NETWORK = `${BASE_PATH}/network`
const DEPLOY_SPLITTER = `${BASE_PATH}/splitter`
const DEPLOY_DIVERSIFIER = `${BASE_PATH}/diversifier`

interface DeployNetworkProps {
  transaction: string
}

export interface DeployNetworkResponseProps {
  id: number
  address: string
}

class DeployerApiService extends BaseApiService {
  constructor(accessToken: string) {
    super(accessToken)
  }

  public async deployNetwork({
    transaction,
  }: DeployNetworkProps): Promise<DeployNetworkResponseProps[]> {
    const res = await this.post(DEPLOY_NETWORK, { transaction })
    return res.contracts
  }
}

export default DeployerApiService
