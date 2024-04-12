import bearer from "@elysiajs/bearer"
import jwt from "@elysiajs/jwt"
import { Elysia, t } from "elysia"
import { AuthenticationError } from "../errors"
import { Prisma, PrismaClient } from "@prisma/client"
import SoroSplitsSDK from "@sorosplits/sdk"

const deployerHandlers = new Elysia({ prefix: "/deployer" })
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
        splitterContracts: true,
        diversifierContracts: true,
        pinnedContractIds: true,
      },
    })
    if (!user) {
      throw new AuthenticationError("Unauthorized!")
    }
    const contract = new SoroSplitsSDK.DeployerContract(
      "testnet",
      user.publicKey
    )
    return { user, contract }
  })
  .post(
    "/network",
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
      const txParams = decodedTransactionParams.args as Record<string, any>[]

      const sendTxRes = await contract.sendTransaction(transaction)
      const getTxRes = await contract.getTransaction(sendTxRes)
      const contracts = await contract.parseDeployedNetworkContractAddresses(
        getTxRes
      )

      for (let contract of contracts) {
        let txParam = txParams.find((item: any) => item.id === contract.id)
        if (!txParam) {
          throw new Error("Contract not found!")
        }

        if (txParam.isSplitter) {
          await prisma.splitterContract.create({
            data: {
              address: contract.address,
              ownerId: user.id,
              transactions: {
                create: {
                  action: decodedTransactionParams.functionName,
                  data: decodedTransactionParams.args as unknown as Prisma.JsonObject,
                },
              },
            },
          })
        }
      }

      return { contracts }
    },
    {
      body: t.Object({
        transaction: t.String(),
      }),
    }
  )

export { deployerHandlers }
