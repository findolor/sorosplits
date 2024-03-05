import BaseContract from "./Base"
import {
  Address,
  Contract,
  Operation,
  SorobanRpc,
  StrKey,
  nativeToScVal,
  xdr,
} from "@stellar/stellar-sdk"
import { randomBytes } from "crypto"
import CONFIG, { Network } from "../config"
import ba from "../utils/binascii"
// import { hexToByte } from "../utils/hexToByte"

export interface ShareDataProps {
  share: number
  shareholder: string
}

export type CallMethod =
  | "init"
  | "distribute_tokens"
  | "update_shares"
  | "lock_contract"

export interface CallContractArgs<T extends CallMethod> {
  contractId: string
  method: T
  args: MethodArgs<T>
}

export type MethodArgs<T extends CallMethod> = T extends "init"
  ? {
      admin: string
      name: string
      shares: ShareDataProps[]
      updatable: boolean
    }
  : T extends "distribute_tokens"
  ? { token_address: string }
  : T extends "update_shares"
  ? { shares: ShareDataProps[] }
  : T extends "lock_contract"
  ? {}
  : never

export type QueryMethod = "list_shares" | "get_config"

export interface QueryContractArgs<T extends QueryMethod> {
  contractId: string
  method: T
  args: QueryArgs<T>
}

export type QueryArgs<T extends QueryMethod> = T extends "list_shares"
  ? {}
  : T extends "get_config"
  ? {}
  : never

export interface ContractConfigResult {
  admin: string
  name: Uint8Array
  updatable: boolean
}

export type QueryContractResult<T extends QueryMethod> = T extends "get_config"
  ? ContractConfigResult
  : T extends "list_shares"
  ? ShareDataProps[]
  : never

export interface DeployAndInitContractArgs {
  name: string
  shares: ShareDataProps[]
  updatable: boolean
}

export class SplitterContract extends BaseContract {
  constructor(network: Network, walletAddress: string) {
    super(network, walletAddress)
  }

  public async deployAndInit({ name, shares, updatable }: DeployAndInitContractArgs) {
    const contract = new Contract(CONFIG[this.network].deployerContractId)

    let splitterArgs = [
      new Address(this.walletAddress || "").toScVal(),
      xdr.ScVal.scvBytes(Buffer.from(name, 'utf-8')),
      xdr.ScVal.scvVec(
        shares.map((item) => {
          xdr.ScVal
          return xdr.ScVal.scvMap([
            new xdr.ScMapEntry({
              key: xdr.ScVal.scvSymbol("share"),
              val: nativeToScVal(item.share, { type: "i128" }),
            }),
            new xdr.ScMapEntry({
              key: xdr.ScVal.scvSymbol("shareholder"),
              val: new Address(item.shareholder.toString()).toScVal(),
            }),
          ])
        })
      ),
      xdr.ScVal.scvBool(updatable),
    ]

    let deployerArgs = [
      nativeToScVal(this.walletAddress, { type: "address" }),
      nativeToScVal(
        Buffer.from(
          ba.unhexlify(CONFIG[this.network].splitterWasmHash),
          "ascii"
        ),
        {
          type: "bytes",
        }
      ),
      nativeToScVal(Buffer.from(randomBytes(32)), { type: "bytes" }),
      nativeToScVal("init", { type: "symbol" }),
      xdr.ScVal.scvVec(splitterArgs),
    ]

    let operation = contract.call("deploy", ...deployerArgs)

    const transaction = await this.processTransaction(operation)

    if (
      transaction.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS &&
      transaction.resultMetaXdr
    ) {
      const buff = Buffer.from(
        transaction.resultMetaXdr.toXDR("base64"),
        "base64"
      )
      const txMeta = xdr.TransactionMeta.fromXDR(buff)
      const contractId =
        txMeta
          .v3()
          .sorobanMeta()
          ?.returnValue()
          .vec()
          ?.at(0)
          ?.address()
          .contractId() as Buffer
      return StrKey.encodeContract(contractId)
    } else throw new Error("Transaction failed")
  }

  public async call<T extends CallMethod>({
    contractId,
    method,
    args,
  }: CallContractArgs<T>) {
    const contract = new Contract(contractId)

    let operation: xdr.Operation<Operation>
    let callArgs: any

    switch (method) {
      case "init":
        callArgs = args as MethodArgs<"init">
        operation = contract.call(
          "init",
          ...[
            new Address(this.walletAddress || "").toScVal(),
            xdr.ScVal.scvBytes(Buffer.from(callArgs.name, 'utf-8')),
            xdr.ScVal.scvVec(
              callArgs.shares.map((item) => {
                xdr.ScVal
                return xdr.ScVal.scvMap([
                  new xdr.ScMapEntry({
                    key: xdr.ScVal.scvSymbol("share"),
                    val: nativeToScVal(item.share, { type: "i128" }),
                  }),
                  new xdr.ScMapEntry({
                    key: xdr.ScVal.scvSymbol("shareholder"),
                    val: new Address(item.shareholder.toString()).toScVal(),
                  }),
                ])
              })
            ),
            xdr.ScVal.scvBool(callArgs.updatable),
          ]
        )
        break
      case "update_shares":
        callArgs = args as MethodArgs<"update_shares">
        operation = contract.call(
          "update_shares",
          ...[
            xdr.ScVal.scvVec(
              callArgs.shares.map((item) => {
                xdr.ScVal
                return xdr.ScVal.scvMap([
                  new xdr.ScMapEntry({
                    key: xdr.ScVal.scvSymbol("share"),
                    val: nativeToScVal(item.share, { type: "i128" }),
                  }),
                  new xdr.ScMapEntry({
                    key: xdr.ScVal.scvSymbol("shareholder"),
                    val: new Address(item.shareholder.toString()).toScVal(),
                  }),
                ])
              })
            ),
          ]
        )
        break
      case "lock_contract":
        operation = contract.call(method, ...[])
        break
      case "distribute_tokens":
        callArgs = args as MethodArgs<"distribute_tokens">
        operation = contract.call(
          method,
          ...[new Address(callArgs.token_address).toScVal()]
        )
        break
      default:
        throw new Error("Invalid method")
    }

    await this.processTransaction(operation)
  }

  public async query<T extends QueryMethod>({
    contractId,
    method,
  }: QueryContractArgs<T>): Promise<QueryContractResult<T>> {
    const contract = new Contract(contractId)

    let operation: xdr.Operation<Operation>

    switch (method) {
      case "list_shares":
        operation = contract.call(method)
        break
      case "get_config":
        operation = contract.call(method)
        break
      default:
        throw new Error("Invalid query method")
    }

    return this.processQuery(operation)
  }
}

export default SplitterContract
