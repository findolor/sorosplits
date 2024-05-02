import bearer from "@elysiajs/bearer"
import jwt from "@elysiajs/jwt"
import { Elysia, t } from "elysia"
import { AuthenticationError } from "../errors"
import { PrismaClient, Prisma } from "@prisma/client"
import SorosplitsSDK from "sorosplits-sdk"
import { xdr } from "@stellar/stellar-sdk"

const contractHandlers = new Elysia({ prefix: "/contract" })
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
          orderBy: {
            createdAt: "desc",
          },
        },
        pinnedContractIds: true,
      },
    })
    if (!user) {
      throw new AuthenticationError("Unauthorized!")
    }
    const splitterContract = new SorosplitsSDK.SplitterContract(
      "testnet",
      user.publicKey
    )
    const diversifierContract = new SorosplitsSDK.DiversifierContract(
      "testnet",
      user.publicKey
    )
    return { user, splitterContract, diversifierContract }
  })
  .post(
    "/call",
    async ({
      user,
      splitterContract,
      diversifierContract,
      body: { transaction, contractType },
      prisma,
    }) => {
      if (
        !diversifierContract.verifyTransactionSourceAccount({
          sourceAccount: user.publicKey,
          xdrString: transaction,
        })
      ) {
        throw new Error("Invalid source account")
      }

      let decodedTransactionParams
      switch (contractType) {
        case "splitter":
          decodedTransactionParams = splitterContract.decodeTransactionParams({
            xdrString: transaction,
          })
          break
        case "diversifier":
          decodedTransactionParams =
            diversifierContract.decodeTransactionParams({
              xdrString: transaction,
            })
          break
      }
      if (!decodedTransactionParams) {
        throw new Error("Invalid transaction")
      }

      // Contract class does not matter here
      const sendTxRes = await diversifierContract.sendTransaction(transaction)

      try {
        await diversifierContract.getTransaction(sendTxRes)

        await prisma.contract.update({
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
      } catch (error: any) {
        console.log(error.message)
        const txResult = xdr.TransactionResult.fromXDR(error.message, "base64")
        console.log(txResult)
        throw new Error(JSON.stringify(txResult))
      }
    },
    {
      body: t.Object({
        transaction: t.String(),
        contractType: t.String(),
      }),
    }
  )
  .post(
    "/toggle-pin",
    async ({ prisma, user, body: { address } }) => {
      if (user.pinnedContractIds.includes(address)) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            pinnedContractIds: {
              set: user.pinnedContractIds.filter((id) => id !== address),
            },
          },
        })
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            pinnedContractIds: {
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
      return { pinned: user.pinnedContractIds.includes(address) }
    },
    {
      query: t.Object({
        address: t.String(),
      }),
    }
  )
  .get("/my-contracts", async ({ user, splitterContract }) => {
    const data = await Promise.all(
      user.contracts.map(async (record) => {
        if (record.data) {
          const splitterAddress = (record.data as Record<string, any>)
            .splitterAddress as string
          const item = await splitterContract.query({
            contractId: splitterAddress,
            method: "get_config",
            args: {},
          })
          return {
            address: record.address,
            name: Buffer.from(item.name).toString("utf-8"),
            createdAt: record.createdAt,
          }
        }
      })
    )
    return data
  })
  .get("/pinned", async ({ prisma, user, splitterContract }) => {
    const data = await Promise.all(
      user.pinnedContractIds.reverse().map(async (address) => {
        const record = await prisma.contract.findUnique({
          where: { address },
        })
        if (!record) {
          return null
        }
        const item = await splitterContract.query({
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

export { contractHandlers }
