import BaseApiService from "./Base"

class TokenApiService extends BaseApiService {
  getTokenList = async () => {
    const res = await fetch("https://api.soroswap.finance/api/tokens", {
      method: "GET",
    })
    if (!res.ok) {
      const error = await res.text()
      throw new Error(error)
    }
    return res.json()
  }
}

export default TokenApiService
