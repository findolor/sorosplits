import {
  Address,
  Contract,
  Operation,
  StrKey,
  nativeToScVal,
  scValToNative,
  xdr,
} from "@stellar/stellar-base"
import {
  ShareDataProps,
  DeployAndInitContractArgs as SplitterDeployAndInitContractArgs,
} from "./Splitter"
import CONFIG, { Network } from "../config"
import ba from "../utils/binascii"
import { randomBytes } from "crypto"
import BaseContract from "./Base"

export type CallMethod =
  | "init_diversifier"
  | "update_whitelisted_swap_tokens"
  | "swap_and_distribute_tokens"

export type MethodArgs<T extends CallMethod> = T extends "init_diversifier"
  ? {
      admin: string
      wasmHash: string
      salt: string
      splitterInitArgs: [string, ShareDataProps[], boolean]
    }
  : T extends "update_whitelisted_swap_tokens"
  ? { tokenAddress: string; swapTokens: string[] }
  : T extends "swap_and_distribute_tokens"
  ? { swapPath: string[]; amount: number }
  : never

export interface CallContractArgs<T extends CallMethod> {
  contractId: string
  method: T
  args: MethodArgs<T>
}

export type QueryMethod =
  | "get_diversifier_config"
  | "list_whitelisted_swap_tokens"

export type QueryArgs<T extends QueryMethod> =
  T extends "get_diversifier_config"
    ? {}
    : T extends "list_whitelisted_swap_tokens"
    ? { tokenAddress: string }
    : never

export interface QueryContractArgs<T extends QueryMethod> {
  contractId: string
  method: T
  args: QueryArgs<T>
}

export type QueryContractResult<T extends QueryMethod> =
  T extends "get_diversifier_config"
    ? ContractConfigResult
    : T extends "list_whitelisted_swap_tokens"
    ? string[]
    : never

export interface ContractConfigResult {
  admin: string
  splitter_address: string
  diversifier_active: boolean
}

export interface DecodeArgs {
  xdrString: string
}

export interface DecodeInitResult {
  admin: string
  name: string
  shares: ShareDataProps[]
  updatable: boolean
}

export class DiversifierContract extends BaseContract {
  constructor(network: Network, walletAddress: string) {
    super(network, walletAddress)
  }

  public getDeployAndInitOperation({
    name,
    shares,
    updatable,
  }: SplitterDeployAndInitContractArgs): xdr.Operation {
    const contract = new Contract(CONFIG[this.network].deployerContractId)

    let initSplitterArgs = [
      xdr.ScVal.scvBytes(Buffer.from(name, "utf-8")),
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
    let splitterDeployerArgs = [
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
      xdr.ScVal.scvVec(initSplitterArgs),
    ]

    let diversifierDeployerArgs = [
      nativeToScVal(this.walletAddress, { type: "address" }),
      nativeToScVal(
        Buffer.from(
          ba.unhexlify(CONFIG[this.network].diversifierWasmHash),
          "ascii"
        ),
        {
          type: "bytes",
        }
      ),
      nativeToScVal(Buffer.from(randomBytes(32)), { type: "bytes" }),
      xdr.ScVal.scvVec(splitterDeployerArgs),
    ]

    let operation = contract.call(
      "deploy_diversifier",
      ...diversifierDeployerArgs
    )
    return operation
  }

  public getCallOperation<T extends CallMethod>({
    contractId,
    method,
    args,
  }: CallContractArgs<T>): xdr.Operation {
    const contract = new Contract(contractId)

    let operation: xdr.Operation<Operation>

    switch (method) {
      case "init_diversifier":
        let initArgs = args as MethodArgs<"init_diversifier">
        operation = contract.call(
          method,
          ...[
            new Address(initArgs.admin).toScVal(),
            nativeToScVal(
              Buffer.from(ba.unhexlify(initArgs.wasmHash), "ascii"),
              { type: "bytes" }
            ),
            nativeToScVal(Buffer.from(initArgs.salt), { type: "bytes" }),
            xdr.ScVal.scvVec([
              xdr.ScVal.scvBytes(
                Buffer.from(initArgs.splitterInitArgs[0], "utf-8")
              ),
              xdr.ScVal.scvVec(
                initArgs.splitterInitArgs[1].map((item) => {
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
              xdr.ScVal.scvBool(initArgs.splitterInitArgs[2]),
            ]),
          ]
        )
        break
      case "update_whitelisted_swap_tokens":
        let updateTokensArgs =
          args as MethodArgs<"update_whitelisted_swap_tokens">
        operation = contract.call(
          method,
          ...[
            new Address(updateTokensArgs.tokenAddress).toScVal(),
            xdr.ScVal.scvVec(
              updateTokensArgs.swapTokens.map((token) => {
                return new Address(token).toScVal()
              })
            ),
          ]
        )
        break
      case "swap_and_distribute_tokens":
        let swapAndDistributeArgs =
          args as MethodArgs<"swap_and_distribute_tokens">
        operation = contract.call(
          method,
          ...[
            xdr.ScVal.scvVec(
              swapAndDistributeArgs.swapPath.map((address) => {
                return new Address(address).toScVal()
              })
            ),
            nativeToScVal(swapAndDistributeArgs.amount, { type: "i128" }),
          ]
        )
        break
      default:
        throw new Error("Invalid method")
    }

    return operation
  }

  public async call<T extends CallMethod>({
    contractId,
    method,
    args,
  }: CallContractArgs<T>) {
    const operation = this.getCallOperation({ contractId, method, args })
    return this.processSingleTransaction(operation)
  }

  public async query<T extends QueryMethod>({
    contractId,
    method,
    args,
  }: QueryContractArgs<T>): Promise<QueryContractResult<T>> {
    const contract = new Contract(contractId)

    let operation: xdr.Operation<Operation>

    switch (method) {
      case "get_diversifier_config":
        operation = contract.call(method)
        break
      case "list_whitelisted_swap_tokens":
        let whitelistedSwapTokensArgs =
          args as QueryArgs<"list_whitelisted_swap_tokens">
        operation = contract.call(
          method,
          ...[new Address(whitelistedSwapTokensArgs.tokenAddress).toScVal()]
        )
        break
      default:
        throw new Error("Invalid query method")
    }

    return this.processQuery(operation)
  }

  private decodeDeployDiversifierParams(args: xdr.ScVal[]): DecodeInitResult {
    let admin = scValToNative(args[0])
    const [name, shares, updatable] = scValToNative(
      xdr.ScVal.scvVec([args[3]])
    )[0]
    return {
      admin,
      name: Buffer.from(name).toString("utf-8"),
      shares: shares.map((item) => {
        return {
          shareholder: item.shareholder.toString(),
          share: Number(BigInt(item.share)),
        }
      }),
      updatable,
    }
  }

  private decodeUpdateWhitelistedSwapTokensParams(args: xdr.ScVal[]) {
    const [tokenAddress, swapTokens] = scValToNative(args[0])
    return {
      tokenAddress: tokenAddress.toString(),
      swapTokens: swapTokens.map((item) => {
        return item.toString()
      }),
    }
  }

  private decodeSwapAndDistributeTokensParams(args: xdr.ScVal[]) {
    const [swapPaths, amount] = scValToNative(args[0])
    return {
      swapPaths: swapPaths.map((item) => {
        return item.toString()
      }),
      amount: Number(BigInt(amount)),
    }
  }

  public decodeTransactionParams({ xdrString }: DecodeArgs) {
    const invokeContract = xdr.TransactionEnvelope.fromXDR(xdrString, "base64")
      .v1()
      .tx()
      .operations()[0]
      .body()
      .invokeHostFunctionOp()
      .hostFunction()
      .invokeContract()
    const functionName = Buffer.from(invokeContract.functionName()).toString(
      "utf-8"
    )
    const contractAddress = StrKey.encodeContract(
      invokeContract.contractAddress().contractId()
    )
    const args = invokeContract.args()

    let response = {
      functionName,
      contractAddress,
      args: {},
    }

    switch (functionName) {
      case "init_diversifier":
        throw new Error("Not implemented")
      case "deploy_diversifier":
        response.args = this.decodeDeployDiversifierParams(args)
        break
      case "update_whitelisted_swap_tokens":
        response.args = this.decodeUpdateWhitelistedSwapTokensParams(args)
        break
      case "swap_and_distribute_tokens":
        response.args = this.decodeSwapAndDistributeTokensParams(args)
        break
      default:
        throw new Error("Invalid transaction function!")
    }

    return response
  }
}
