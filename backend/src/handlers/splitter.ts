import bearer from "@elysiajs/bearer"
import jwt from "@elysiajs/jwt"
import { Elysia } from "elysia"
import { AuthenticationError } from "../errors"

export default new Elysia({ prefix: "/splitter" })
  .use(bearer())
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET as string,
    })
  )
  .derive(async ({ jwt, bearer }) => {
    const user = await jwt.verify(bearer)
    if (!user) {
      throw new AuthenticationError("Unauthorized")
    }
    return { publicKey: user.id }
  })
  .get("/:contractId/interactions", async ({ params: { contractId }, publicKey }) => {
    console.log(publicKey)
    return { contractId }
  })
