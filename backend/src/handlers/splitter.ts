import bearer from "@elysiajs/bearer"
import jwt from "@elysiajs/jwt"
import { Elysia, t } from "elysia"
import { AuthenticationError } from "../errors"
import { Contract, Keypair } from "@stellar/stellar-sdk"
import { PrismaClient } from "@prisma/client"

export default new Elysia({ prefix: "/splitter" })
  .decorate("prisma", new PrismaClient())
  .use(bearer())
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET as string,
    })
  )
  .derive(async ({ jwt, bearer, prisma }) => {
    const payload = await jwt.verify(bearer)
    if (!payload) {
      throw new AuthenticationError("Unauthorized")
    }
    const user = await prisma.user.findUnique({
      where: { publicKey: payload.publicKey as string },
    })
    if (!user) {
      throw new AuthenticationError("Unauthorized")
    }
    return { user }
  })
  .post(
    "/create",
    async ({ user, body: { contractId }, prisma }) => {
      // Make sure the contractId is valid
      new Contract(contractId)

      const splitterContract = await prisma.splitterContract.create({
        data: {
          address: contractId,
          ownerId: user.id,
        },
      })

      await prisma.user.update({
        where: { id: user.id },
        data: {
          splitterContracts: {
            connect: [splitterContract],
          },
        },
      })

      return true
    },
    {
      body: t.Object({
        contractId: t.String(),
      }),
    }
  )
  .get("/my-contracts", async ({ prisma, user }) => {
    const data = await prisma.user.findUnique({ where: { id: user.id }, select: {
      splitterContracts: {
        select: {
          address: true,
          transactions: true
        }
      }
    } })
    return data?.splitterContracts
  })
