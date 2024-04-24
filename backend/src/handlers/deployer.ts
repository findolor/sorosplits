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
        contracts: true,
        pinnedContractIds: true,
      },
    })
    if (!user) {
      throw new AuthenticationError("Unauthorized!")
    }
    const deployerContract = new SoroSplitsSDK.DeployerContract(
      "testnet",
      user.publicKey
    )
    const splitterContract = new SoroSplitsSDK.SplitterContract(
      "testnet",
      user.publicKey
    )
    const diversifierContract = new SoroSplitsSDK.DiversifierContract(
      "testnet",
      user.publicKey
    )
    return { user, deployerContract, splitterContract, diversifierContract }
  })
  .post(
    "/diversifier",
    async ({
      user,
      deployerContract,
      diversifierContract,
      body: { transaction },
      prisma,
    }) => {
      if (
        !deployerContract.verifyTransactionSourceAccount({
          sourceAccount: user.publicKey,
          xdrString: transaction,
        })
      ) {
        throw new Error("Invalid source account")
      }

      const decodedTransactionParams = deployerContract.decodeTransactionParams(
        {
          xdrString: transaction,
        }
      )

      const sendTxRes = await deployerContract.sendTransaction(transaction)
      const getTxRes = await deployerContract.getTransaction(sendTxRes)
      const contractAddress =
        deployerContract.parseDeployedContractAddress(getTxRes)

      const splitterAddress = (
        await diversifierContract.query({
          contractId: contractAddress,
          method: "get_diversifier_config",
          args: {},
        })
      ).splitter_address
      await prisma.contract.create({
        data: {
          address: contractAddress,
          ownerId: user.id,
          type: "diversifier",
          data: {
            splitterAddress,
          },
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
    "/network",
    async ({
      user,
      deployerContract,
      diversifierContract,
      body: { transaction },
      prisma,
    }) => {
      if (
        !deployerContract.verifyTransactionSourceAccount({
          sourceAccount: user.publicKey,
          xdrString: transaction,
        })
      ) {
        throw new Error("Invalid source account")
      }

      const decodedTransactionParams = deployerContract.decodeTransactionParams(
        {
          xdrString: transaction,
        }
      )
      const txParams = decodedTransactionParams.args as Record<string, any>[]

      const sendTxRes = await deployerContract.sendTransaction(transaction)
      const getTxRes = await deployerContract.getTransaction(sendTxRes)
      const contracts =
        await deployerContract.parseDeployedNetworkContractAddresses(getTxRes)

      for (let contract of contracts) {
        let txParam = txParams.find((item: any) => item.id === contract.id)
        if (!txParam) {
          throw new Error("Contract not found!")
        }

        if (txParam.isSplitter) {
          await prisma.contract.create({
            data: {
              address: contract.address,
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
        } else {
          const splitterAddress = (
            await diversifierContract.query({
              contractId: contract.address,
              method: "get_diversifier_config",
              args: {},
            })
          ).splitter_address
          await prisma.contract.create({
            data: {
              address: contract.address,
              ownerId: user.id,
              type: "diversifier",
              data: {
                splitterAddress,
              },
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
