import bearer from "@elysiajs/bearer"
import jwt from "@elysiajs/jwt"
import { Elysia, t } from "elysia"
import { AuthenticationError } from "../errors"
import { Prisma, PrismaClient } from "@prisma/client"
import SoroSplitsSDK from "@sorosplits/sdk"

export default new Elysia({ prefix: "/splitter" })
  .decorate("prisma", new PrismaClient())
  .get(
    "/transactions",
    async ({ prisma, query: { address } }) => {
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
      query: t.Object({
        address: t.String(),
      }),
    }
  )
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

      const decodedTransactionParams = contract.decodeTransactionParams({
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
              action: decodedTransactionParams.functionName,
              data: decodedTransactionParams.args as unknown as Prisma.JsonObject,
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

      const decodedTransactionParams = contract.decodeTransactionParams({
        xdrString: transaction,
      })

      const sendTxRes = await contract.sendTransaction(transaction)
      await contract.getTransaction(sendTxRes)

      await prisma.splitterContract.update({
        where: { address: decodedTransactionParams.contractAddress },
        data: {
          transactions: {
            create: {
              action: decodedTransactionParams.functionName,
              data: decodedTransactionParams.args as unknown as Prisma.JsonObject,
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
  .get("/my-contracts", async ({ prisma, user, contract }) => {
    const records = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        splitterContracts: {
          select: {
            createdAt: true,
            address: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })
    if (!records) {
      return []
    }
    const data = await Promise.all(
      records.splitterContracts.map(async (record) => {
        const item = await contract.query({
          contractId: record.address,
          method: "get_config",
          args: {},
        })
        return {
          address: record.address,
          name: Buffer.from(item.name).toString("utf-8"),
          createdAt: record.createdAt,
        }
      })
    )
    return data
  })
