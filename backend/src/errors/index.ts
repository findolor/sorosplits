export class AuthenticationError extends Error {
  constructor(public message: string) {
    super(message)
  }
}

export class AuthorizationError extends Error {
  constructor(public message: string) {
    super(message)
  }
}

export class InvariantError extends Error {
  constructor(public message: string) {
    super(message)
  }
}
