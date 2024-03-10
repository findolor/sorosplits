import bearer from "@elysiajs/bearer"
import jwt from "@elysiajs/jwt"
import { Elysia, t } from "elysia"
import { AuthenticationError } from "../errors"
import { Prisma, PrismaClient } from "@prisma/client"
import SoroSplitsSDK from "@sorosplits/sdk"

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
      throw new AuthenticationError("Unauthorized!")
    }
    const user = await prisma.user.findUnique({
      where: { publicKey: payload.publicKey as string },
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

      console.log(transaction)

      const decodedTransaction = contract.decodeTransaction({
        xdrString: transaction,
      })

      const sendTxRes = await contract.sendTransaction(transaction)
      const getTxRes = await contract.getTransaction(sendTxRes)
      const contractAddress = await contract.parseDeployedContractAddress(
        getTxRes
      )

      const splitterContract = await prisma.splitterContract.create({
        data: {
          address: contractAddress,
          ownerId: user.id,
          transactions: {
            create: {
              action: decodedTransaction.functionName,
              data: decodedTransaction.args as unknown as Prisma.JsonObject,
            },
          },
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

      return { contractAddress }
    },
    {
      body: t.Object({
        transaction: t.String(),
      }),
    }
  )
  .post(
    "/call",
    async ({ user, contract, body: { transaction }, prisma }) => {
      if (
        !contract.verifyTransactionSourceAccount({
          sourceAccount: user.publicKey,
          xdrString: transaction,
        })
      ) {
        throw new Error("Invalid source account")
      }

      const decodedTransaction = contract.decodeTransaction({
        xdrString: transaction,
      })

      const sendTxRes = await contract.sendTransaction(transaction)
      await contract.getTransaction(sendTxRes)

      await prisma.splitterContract.update({
        where: { address: decodedTransaction.contractAddress },
        data: {
          transactions: {
            create: {
              action: decodedTransaction.functionName,
              data: decodedTransaction.args as unknown as Prisma.JsonObject,
            },
          },
        },
      })

      return {}
    },
    {
      body: t.Object({
        transaction: t.String(),
      }),
    }
  )
  .get("/my-contracts", async ({ prisma, user }) => {
    const data = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        splitterContracts: {
          select: {
            address: true,
          },
        },
      },
    })
    return data?.splitterContracts
  })
  .get(
    "/:address/transactions",
    async ({ prisma, params: { address } }) => {
      // TODO: Figure out pagination
      const data = await prisma.splitterContract.findUnique({
        where: { address },
        select: {
          transactions: {
            take: 10,
            select: {
              createdAt: true,
              action: true,
              data: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      })
      return data
    },
    {
      params: t.Object({
        address: t.String(),
      }),
    }
  )
