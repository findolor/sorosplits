import { Elysia, NotFoundError, t } from "elysia"
import { Keypair } from "@stellar/stellar-sdk"
import jwt from "@elysiajs/jwt"
import bearer from "@elysiajs/bearer"
import { PrismaClient } from "@prisma/client"
import { randomBytes } from "node:crypto"
import { AuthenticationError } from "../errors"

const authenticationHandlers = new Elysia({ prefix: "/auth" })
  .decorate("prisma", new PrismaClient())
  .use(bearer())
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET as string,
      exp: "7d",
    })
  )
  .get(
    "/nonce",
    async ({ query: { publicKey }, prisma }) => {
      // Check if the public key is valid
      Keypair.fromPublicKey(publicKey)

      const nonce = randomBytes(16).toString("hex")

      const user = await prisma.user.findUnique({ where: { publicKey } })

      if (user === null) {
        await prisma.user.create({ data: { publicKey, nonce } })
      } else {
        await prisma.user.update({ where: { publicKey }, data: { nonce } })
      }

      return { nonce }
    },
    {
      query: t.Object({
        publicKey: t.String(),
      }),
    }
  )
  .post(
    "/connect",
    async ({ body: { publicKey, signature }, jwt, prisma }) => {
      const user = await prisma.user.findUnique({ where: { publicKey } })
      if (user === null) {
        throw new NotFoundError("User not found!")
      }

      const nonce = user.nonce
      const signingData = {
        message: "SoroSplits connection message for authentication",
        nonce,
      }

      const isValid = Keypair.fromPublicKey(publicKey).verify(
        Buffer.from(JSON.stringify(signingData)),
        Buffer.from(signature, "base64")
      )

      if (isValid) {
        const accessToken = await jwt.sign({ publicKey })
        return { accessToken }
      } else {
        throw new AuthenticationError("Invalid signature!")
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
