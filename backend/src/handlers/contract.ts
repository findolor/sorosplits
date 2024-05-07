import bearer from "@elysiajs/bearer"
import jwt from "@elysiajs/jwt"
import { Elysia, t } from "elysia"
import { AuthenticationError } from "../errors"
import { PrismaClient, Prisma } from "@prisma/client"
import SorosplitsSDK from "sorosplits-sdk"
import { xdr } from "@stellar/stellar-sdk"
import {
  Router,
  Token,
  CurrencyAmount,
  TradeType,
  Networks,
  Protocols,
} from "soroswap-router-sdk"
import { TokenContract } from "sorosplits-sdk/lib/contracts"

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
    const tokenContract = new SorosplitsSDK.TokenContract(
      "testnet",
      user.publicKey
    )
    return { user, splitterContract, diversifierContract, tokenContract }
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
        const txResult = xdr.TransactionResult.fromXDR(error.message, "base64")
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
  .get(
    "/swap-path",
    async ({
      query: { sourceTokenAddress, destinationTokenAddress, amount },
      tokenContract,
    }) => {
      const [SOURCE_TOKEN, DESTINATION_TOKEN] = await Promise.all([
        getSoroswapRouterToken(tokenContract, sourceTokenAddress),
        getSoroswapRouterToken(tokenContract, destinationTokenAddress),
      ])

      const router = new Router({
        backendUrl: process.env.SOROSWAP_BACKEND_URL as string,
        backendApiKey: process.env.SOROSWAP_API_KEY as string,
        pairsCacheInSeconds: 20,
        protocols: [Protocols.SOROSWAP],
        network: Networks.TESTNET,
      })

      const currencyAmount = CurrencyAmount.fromRawAmount(SOURCE_TOKEN, amount)
      const quoteCurrency = DESTINATION_TOKEN

      const route = await router.route(
        currencyAmount,
        quoteCurrency,
        TradeType.EXACT_INPUT
      )

      return {
        swapPath: route?.trade.path || [],
      }
    },
    {
      query: t.Object({
        sourceTokenAddress: t.String(),
        destinationTokenAddress: t.String(),
        amount: t.String(),
      }),
    }
  )

const getSoroswapRouterToken = async (
  tokenContract: TokenContract,
  tokenAddresss: string
) => {
  const sourceTokenRes = await Promise.all([
    tokenContract.query({
      contractId: tokenAddresss,
      method: "get_token_name",
      args: {},
    }),
    tokenContract.query({
      contractId: tokenAddresss,
      method: "get_token_symbol",
      args: {},
    }),
    tokenContract.query({
      contractId: tokenAddresss,
      method: "get_token_decimal",
      args: {},
    }),
  ])
  return new Token(
    Networks.TESTNET,
    tokenAddresss,
    sourceTokenRes[2],
    sourceTokenRes[1],
    sourceTokenRes[0]
  )
}

export { contractHandlers }
