import bearer from "@elysiajs/bearer"
import jwt from "@elysiajs/jwt"
import { Elysia, t } from "elysia"
import { AuthenticationError } from "../errors"
import { Prisma, PrismaClient } from "@prisma/client"
import SoroSplitsSDK from "@sorosplits/sdk"

const splitterHandlers = new Elysia({ prefix: "/splitter" })
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
      throw new AuthenticationError("Unauthorized!")
    }
    const user = await prisma.user.findUnique({
      where: { publicKey: payload.publicKey as string },
      select: {
        id: true,
        publicKey: true,
        contracts: {
          where: { type: "splitter" },
        },
        pinnedContractIds: true,
      },
    })
    if (!user) {
      throw new AuthenticationError("Unauthorized!")
    }
    const contract = new SoroSplitsSDK.SplitterContract(
      "testnet",
      user.publicKey
    )
    return { user, contract }
  })
  .post(
    "/create",
    async ({ user, contract, body: { transaction }, prisma }) => {
      if (
        !contract.verifyTransactionSourceAccount({
          sourceAccount: user.publicKey,
          xdrString: transaction,
        })
      ) {
        throw new Error("Invalid source account")
      }

      const decodedTransactionParams = contract.decodeTransactionParams({
        xdrString: transaction,
      })

      const sendTxRes = await contract.sendTransaction(transaction)
      const getTxRes = await contract.getTransaction(sendTxRes)
      const contractAddress = await contract.parseDeployedContractAddress(
        getTxRes
      )

      await prisma.contract.create({
        data: {
          address: contractAddress,
          ownerId: user.id,
          type: "splitter",
          data: {},
          transactions: {
            create: {
              action: decodedTransactionParams.functionName,
              data: decodedTransactionParams.args as unknown as Prisma.JsonObject,
            },
          },
        },
      })

      return { contractAddress }
    },
    {
      body: t.Object({
        transaction: t.String(),
      }),
    }
  )

export { splitterHandlers }
