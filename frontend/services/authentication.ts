import { signBlob } from "@stellar/freighter-api"

const getNonce = () => {
  // TODO: Get this from backend
  return 10
}

const getAccessToken = async (walletAddress: string): Promise<string> => {
  const nonce = getNonce()

  const signedBlob = (await signBlob(
    btoa(
      JSON.stringify({
        message: "This message used for logging into SoroSplits.",
        nonce,
      })
    ),
    {
      accountToSign: walletAddress,
    }
  )) as unknown as { data: Uint8Array }

  // TODO: URL should be in .env
  const res = await fetch("http://localhost:3001/auth/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      signature: Buffer.from(signedBlob.data).toString("base64"),
      publicKey: walletAddress,
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    console.log(error)
    throw new Error(error)
  }

  const data = await res.json()
  return data.accessToken
}

export { getAccessToken }
