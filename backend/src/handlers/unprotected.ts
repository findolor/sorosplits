import { Elysia, t } from "elysia"
import jwt from "@elysiajs/jwt"
import bearer from "@elysiajs/bearer"
import { PrismaClient } from "@prisma/client"
import SoroSplitsSDK from "@sorosplits/sdk"

const unprotectedHandlers = new Elysia()
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
    "contract/transactions",
    async ({ prisma, query: { address } }) => {
      // TODO: Figure out pagination
      const data = await prisma.contract.findUnique({
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

export { unprotectedHandlers }
