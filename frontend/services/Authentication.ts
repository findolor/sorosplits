import BaseApiService from "./Base"

const BASE_PATH = "auth"
const GET_NONCE = `${BASE_PATH}/nonce`
const CONNECT = `${BASE_PATH}/connect`

interface IGetNonceRequest {
  publicKey: string
}

interface IConnectRequest {
  signature: string
  publicKey: string
}

class AuthenticationApiService extends BaseApiService {
  constructor() {
    super(undefined)
  }

  public async getNonce({ publicKey }: IGetNonceRequest): Promise<string> {
    const res = await this.get(GET_NONCE, { publicKey })
    return res.nonce
  }

  public async connect({
    signature,
    publicKey,
  }: IConnectRequest): Promise<string> {
    const res = await this.post(CONNECT, { signature, publicKey })
    return res.accessToken
  }
}

export default AuthenticationApiService
