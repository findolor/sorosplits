import BaseContract from "./Base"
import { Address, Contract, Operation, xdr } from "stellar-sdk"

export type QueryMethod =
  | "get_token_balance"
  | "get_token_decimal"
  | "get_token_name"
  | "get_token_symbol"

  export interface QueryContractArgs<T extends QueryMethod> {
  contractId: string
  method: QueryMethod
  args: QueryArgs<T>
}

type QueryArgs<T extends QueryMethod> = T extends "get_token_balance"
  ? { id: string }
  : T extends "get_token_decimal"
  ? {}
  : T extends "get_token_name"
  ? {}
  : T extends "get_token_symbol"
  ? {}
  : never

export interface TokenResult {
  name: string
  symbol: string
  balance: BigInt
  decimals: number
  userBalances: BigInt[]
}

export type QueryContractResult<T extends QueryMethod> = T extends "get_token_balance"
  ? BigInt
  : T extends "get_token_decimal"
  ? number
  : T extends "get_token_name"
  ? string
  : T extends "get_token_symbol"
  ? string
  : never

class TokenContract extends BaseContract {
  constructor(walletAddress: string) {
    super(walletAddress)
  }

  public async query<T extends QueryMethod>({
    contractId,
    method,
    args,
  }: QueryContractArgs<T>): Promise<QueryContractResult<T>> {
    const contract = new Contract(contractId)

    let operation: xdr.Operation<Operation>
    let queryArgs

    switch (method) {
      case "get_token_balance":
        queryArgs = args as QueryArgs<"get_token_balance">
        operation = contract.call(
          "balance",
          ...[new Address(queryArgs.id).toScVal()]
        )
        break
      case "get_token_decimal":
        operation = contract.call("decimals")
        break
      case "get_token_name":
        operation = contract.call("name")
        break
      case "get_token_symbol":
        operation = contract.call("symbol")
        break
      default:
        throw new Error("Invalid query method")
    }

    return this.processQuery(operation)
  }
}

export default TokenContract
