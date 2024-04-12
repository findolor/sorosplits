import { Elysia } from "elysia"
import cors from "@elysiajs/cors"
import jwt from "@elysiajs/jwt"
import bearer from "@elysiajs/bearer"
import {
  splitterHandlers,
  authenticationHandlers,
  deployerHandlers,
} from "./handlers"
import {
  AuthenticationError,
  AuthorizationError,
  InvariantError,
} from "./errors"

const application = new Elysia()
  .use(cors())
  .use(bearer())
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET as string }))
  .error("AUTHENTICATION_ERROR", AuthenticationError)
  .error("AUTHORIZATION_ERROR", AuthorizationError)
  .error("INVARIANT_ERROR", InvariantError)
  .onError(({ code, error, set }) => {
    switch (code) {
      case "AUTHENTICATION_ERROR":
        set.status = 401
        return {
          status: "error",
          message: error.toString().replace("Error: ", ""),
        }
      case "AUTHORIZATION_ERROR":
        set.status = 403
        return {
          status: "error",
          message: error.toString().replace("Error: ", ""),
        }
      case "INVARIANT_ERROR":
        set.status = 400
        return {
          status: "error",
          message: error.toString().replace("Error: ", ""),
        }
      case "NOT_FOUND":
        set.status = 404
        return {
          status: "error",
          message: error.toString().replace("Error: ", ""),
        }
      case "INTERNAL_SERVER_ERROR":
        set.status = 500
        return {
          status: "error",
          message: error.toString().replace("Error: ", ""),
        }
    }
  })
  .group("/api", (app) =>
    app
      .get("/health", () => {})
      .use(authenticationHandlers)
      .use(splitterHandlers)
      .use(deployerHandlers)
  )
  .listen(3001)

console.log(
  `🦊 Elysia is running at ${application.server?.hostname}:${application.server?.port}`
)
