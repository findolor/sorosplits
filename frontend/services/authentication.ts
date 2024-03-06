import { signBlob } from "@stellar/freighter-api"

const getNonce = async (walletAddress: string): Promise<string> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/nonce?publicKey=${walletAddress}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(error)
  }

  const data = await res.json()
  return data.nonce
}

const getAccessToken = async (walletAddress: string): Promise<string> => {
  const nonce = await getNonce(walletAddress)

  const signedBlob = (await signBlob(
    btoa(
      JSON.stringify({
        message: "SoroSplits connection message for authentication",
        nonce,
      })
    ),
    {
      accountToSign: walletAddress,
    }
  )) as unknown as { data: Uint8Array }

  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      signature: Buffer.from(signedBlob.data).toString("base64"),
      publicKey: walletAddress,
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(error)
  }

  const data = await res.json()
  return data.accessToken
}

export { getAccessToken }
