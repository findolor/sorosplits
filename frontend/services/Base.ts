class BaseApiService {
  protected url = process.env.NEXT_PUBLIC_SERVER_URL
  protected accessToken: string | undefined

  constructor(accessToken: string | undefined) {
    this.accessToken = accessToken
  }

  protected async get(
    path: string,
    params: Record<string, string>
  ): Promise<any> {
    const headers = new Headers()
    headers.append("Content-Type", "application/json")
    if (this.accessToken) {
      headers.append("Authorization", `Bearer ${this.accessToken}`)
    }

    const res = await fetch(
      `${this.url}/${path}?${new URLSearchParams(params).toString()}`,
      {
        method: "GET",
        headers,
      }
    )

    if (!res.ok) {
      const error = await res.text()
      throw new Error(error)
    }

    return res.json()
  }

  protected async post(
    path: string,
    bodyParams?: Record<string, unknown>,
    queryParams?: Record<string, string>
  ): Promise<any> {
    const headers = new Headers()
    headers.append("Content-Type", "application/json")
    if (this.accessToken) {
      headers.append("Authorization", `Bearer ${this.accessToken}`)
    }

    const body = bodyParams ? JSON.stringify(bodyParams) : undefined

    const res = await fetch(
      `${this.url}/${path}?${new URLSearchParams(queryParams).toString()}`,
      {
        method: "POST",
        headers,
        body,
      }
    )

    if (!res.ok) {
      const error = await res.text()
      throw new Error(error)
    }

    return res.json()
  }
}

export default BaseApiService
