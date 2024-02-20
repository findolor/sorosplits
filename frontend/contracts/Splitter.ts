import BaseContract from "./Base"
import { DataProps } from "../components/SplitterData"
import {
  Address,
  Contract,
  Operation,
  SorobanRpc,
  StrKey,
  nativeToScVal,
  xdr,
} from "stellar-sdk"
import { config } from "../utils/config"
import ba from "../utils/binascii"
import { randomBytes } from "crypto"
import { hexToByte } from "../utils/hexToByte"

export type CallMethod =
  | "init"
  | "distribute_tokens"
  | "update_shares"
  | "lock_contract"

export interface CallContractArgs<T extends CallMethod> {
  contractId: string
  method: CallMethod
  args: MethodArgs<T>
}

type MethodArgs<T extends CallMethod> = T extends "init"
  ? {
      admin: string
      shares: DataProps[]
      mutable: boolean
    }
  : T extends "distribute_tokens"
  ? { token_address: string }
  : T extends "update_shares"
  ? { shares: DataProps[] }
  : T extends "lock_contract"
  ? {}
  : never

export type QueryMethod =
  | "list_shares"
  | "get_config"

export interface QueryContractArgs<T extends QueryMethod> {
  contractId: string
  method: QueryMethod
  args: QueryArgs<T>
}

type QueryArgs<T extends QueryMethod> = T extends "list_shares"
  ? {}
  : T extends "get_config"
  ? {}
  : never

export interface ContractConfigResult {
  admin: string
  mutable: boolean
}

export type QueryContractResult<T extends QueryMethod> = T extends "get_config"
  ? ContractConfigResult
  : T extends "list_shares"
  ? DataProps[]
  : never

export interface DeployAndInitContractArgs {
  shares: DataProps[]
  mutable: boolean
}

class SplitterContract extends BaseContract {
  constructor(walletAddress: string) {
    super(walletAddress)
  }

  public async deployAndInit({
    shares,
    mutable,
  }: DeployAndInitContractArgs) {
    const contract = new Contract(config.deployerContractId)

    let splitterArgs = [
      new Address(this.walletAddress || "").toScVal(),
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
      xdr.ScVal.scvBool(mutable),
    ]

    let deployerArgs = [
      nativeToScVal(this.walletAddress, { type: "address" }),
      nativeToScVal(
        Buffer.from(ba.unhexlify(config.splitterWasmHash), "ascii"),
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
          .contractId()
          .toString("hex") || ""
      return StrKey.encodeContract(hexToByte(contractId))
    } else throw new Error("Transaction failed")
  }

  public async call<T extends CallMethod>({
    contractId,
    method,
    args,
  }: CallContractArgs<T>) {
    const contract = new Contract(contractId)

    let operation: xdr.Operation<Operation>
    let callArgs

    switch (method) {
      case "init":
        callArgs = args as MethodArgs<"init">
        operation = contract.call(
          "init",
          ...[
            new Address(this.walletAddress || "").toScVal(),
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
            xdr.ScVal.scvBool(callArgs.mutable),
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
