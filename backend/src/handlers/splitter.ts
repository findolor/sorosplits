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
      return data ?? { transactions: [] }
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
      select: {
        id: true,
        publicKey: true,
        splitterContracts: true,
        pinnedSplitterContractIds: true,
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

      await prisma.splitterContract.create({
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
  .post(
    "/toggle-pin",
    async ({ prisma, user, body: { address } }) => {
      if (user.pinnedSplitterContractIds.includes(address)) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            pinnedSplitterContractIds: {
              set: user.pinnedSplitterContractIds.filter(
                (id) => id !== address
              ),
            },
          },
        })
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            pinnedSplitterContractIds: {
              push: address,
            },
          },
        })
      }
      return {}
    },
    {
      body: t.Object({
        address: t.String(),
      }),
    }
  )
  .get(
    "/is-pinned",
    async ({ user, query: { address } }) => {
      return { pinned: user.pinnedSplitterContractIds.includes(address) }
    },
    {
      query: t.Object({
        address: t.String(),
      }),
    }
  )
  .get("/my-contracts", async ({ user, contract }) => {
    const data = await Promise.all(
      user.splitterContracts.map(async (record) => {
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
  .get("/pinned", async ({ prisma, user, contract }) => {
    const data = await Promise.all(
      user.pinnedSplitterContractIds.map(async (address) => {
        const record = await prisma.splitterContract.findUnique({
          where: { address },
        })
        if (!record) {
          return null
        }
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
    return data.filter((item) => item !== null)
  })
