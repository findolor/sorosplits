import { Elysia, t } from "elysia"
import { Keypair } from "@stellar/stellar-sdk"
import jwt from "@elysiajs/jwt"
import bearer from "@elysiajs/bearer"

const authenticationHandlers = new Elysia({ prefix: "/auth" })
  .use(bearer())
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET as string,
      exp: "7d",
    })
  )
  .post(
    "/connect",
    async ({ body: { publicKey, signature }, jwt, set }) => {
      // TODO: Pull user nonce from database
      const nonce = 10
      const signingData = {
        message: "This message used for logging into SoroSplits.",
        nonce,
      }

      const isValid = Keypair.fromPublicKey(publicKey).verify(
        Buffer.from(JSON.stringify(signingData)),
        Buffer.from(signature, "base64")
      )
      
      if (isValid) {
        set.status = 201
        
        const accessToken = await jwt.sign({ publicKey })

        return { accessToken }
      } else {
        set.status = 401
        throw new Error('Invalid signature!')
      }
    },
    {
      body: t.Object({
        publicKey: t.String(),
        signature: t.String(),
      }),
    }
  )

export { authenticationHandlers }
