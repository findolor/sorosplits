import bearer from "@elysiajs/bearer"
import jwt from "@elysiajs/jwt"
import { Elysia, t } from "elysia"

export default new Elysia({ prefix: "/splitter" })
  .use(bearer())
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET as string,
    })
  )
  .get("/:contractId/interactions", async ({ params: { contractId }, user }) => {
    console.log(user)
    return { contractId }
  })
