import BaseContract from "./Base"
import {
  Address,
  Contract,
  Operation,
  SorobanRpc,
  StrKey,
  nativeToScVal,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk"
import { Network } from "../config"

export interface ShareDataProps {
  share: number
  shareholder: string
}

export type CallMethod =
  | "init_splitter"
  | "update_whitelisted_tokens"
  | "transfer_tokens"
  | "distribute_tokens"
  | "update_shares"
  | "update_name"
  | "lock_contract"
  | "withdraw_allocation"

export interface CallContractArgs<T extends CallMethod> {
  contractId: string
  method: T
  args: MethodArgs<T>
}

export type MethodArgs<T extends CallMethod> = T extends "init_splitter"
  ? {
      admin: string
      name: string
      shares: ShareDataProps[]
      updatable: boolean
    }
  : T extends "update_whitelisted_tokens"
  ? { tokens: string[] }
  : T extends "transfer_tokens"
  ? { recipient: string; tokenAddress: string; amount: number }
  : T extends "distribute_tokens"
  ? { tokenAddress: string; amount: number }
  : T extends "update_shares"
  ? { shares: ShareDataProps[] }
  : T extends "update_name"
  ? { name: string }
  : T extends "lock_contract"
  ? {}
  : T extends "withdraw_allocation"
  ? { tokenAddress: string; shareholder: string; amount: number }
  : never

export type QueryMethod =
  | "list_shares"
  | "get_config"
  | "get_allocation"
  | "list_whitelisted_tokens"
  | "get_unused_tokens"

export interface QueryContractArgs<T extends QueryMethod> {
  contractId: string
  method: T
  args: QueryArgs<T>
}

export type QueryArgs<T extends QueryMethod> = T extends "list_shares"
  ? {}
  : T extends "get_config"
  ? {}
  : T extends "get_allocation"
  ? { shareholderAddress: string; tokenAddress: string }
  : T extends "list_whitelisted_tokens"
  ? {}
  : T extends "get_unused_tokens"
  ? { tokenAddress: string }
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
  : T extends "get_allocation"
  ? BigInt
  : T extends "list_whitelisted_tokens"
  ? string[]
  : T extends "get_unused_tokens"
  ? BigInt
  : never

export interface DecodeArgs {
  xdrString: string
}

export interface DecodeInitResult {
  admin: string
  name: string
  shares: ShareDataProps[]
  updatable: boolean
}

export interface DecodeUpdateSharesResult {
  shares: ShareDataProps[]
}

export interface DecodeDistributeTokensResult {
  tokenAddress: string
}

export class SplitterContract extends BaseContract {
  constructor(network: Network, walletAddress: string) {
    super(network, walletAddress)
  }

  // public async deployAndInit({
  //   name,
  //   shares,
  //   updatable,
  // }: DeployAndInitContractArgs) {
  //   let operation = this.getDeployAndInitOperation({ name, shares, updatable })
  //   const transaction = await this.processSingleTransaction(operation)
  //   return this.parseDeployedContractAddress(transaction)
  // }

  public async parseDeployedContractAddress(
    transaction: SorobanRpc.Api.GetTransactionResponse
  ) {
    if (
      transaction.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS &&
      transaction.resultMetaXdr
    ) {
      const buff = Buffer.from(
        transaction.resultMetaXdr.toXDR("base64"),
        "base64"
      )
      const txMeta = xdr.TransactionMeta.fromXDR(buff)
      const contractId = txMeta
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

  public getCallOperation<T extends CallMethod>({
    contractId,
    method,
    args,
  }: CallContractArgs<T>): xdr.Operation {
    const contract = new Contract(contractId)

    let operation: xdr.Operation<Operation>

    switch (method) {
      case "init_splitter":
        let initArgs = args as MethodArgs<"init_splitter">
        operation = contract.call(
          method,
          ...[
            new Address(this.walletAddress || "").toScVal(),
            xdr.ScVal.scvBytes(Buffer.from(initArgs.name, "utf-8")),
            xdr.ScVal.scvVec(
              initArgs.shares.map((item) => {
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
            xdr.ScVal.scvBool(initArgs.updatable),
          ]
        )
        break
      case "update_shares":
        let updateShareArgs = args as MethodArgs<"update_shares">
        operation = contract.call(
          method,
          ...[
            xdr.ScVal.scvVec(
              updateShareArgs.shares.map((item) => {
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
        operation = contract.call(method)
        break
      case "distribute_tokens":
        let distributeTokensArgs = args as MethodArgs<"distribute_tokens">
        operation = contract.call(
          method,
          ...[
            new Address(distributeTokensArgs.tokenAddress).toScVal(),
            nativeToScVal(distributeTokensArgs.amount, { type: "i128" }),
          ]
        )
        break
      case "transfer_tokens":
        let transferTokensArgs = args as MethodArgs<"transfer_tokens">
        operation = contract.call(
          method,
          ...[
            new Address(transferTokensArgs.tokenAddress).toScVal(),
            new Address(transferTokensArgs.recipient).toScVal(),
            nativeToScVal(transferTokensArgs.amount, { type: "i128" }),
          ]
        )
        break
      case "update_whitelisted_tokens":
        let updateWhitelistedTokensArgs =
          args as MethodArgs<"update_whitelisted_tokens">
        operation = contract.call(
          method,
          ...[
            xdr.ScVal.scvVec(
              updateWhitelistedTokensArgs.tokens.map((token) => {
                return new Address(token).toScVal()
              })
            ),
          ]
        )
        break
      case "update_name":
        let updateNameArgs = args as MethodArgs<"update_name">
        operation = contract.call(
          method,
          ...[xdr.ScVal.scvBytes(Buffer.from(updateNameArgs.name, "utf-8"))]
        )
        break
      case "withdraw_allocation":
        let withdrawAllocationArgs = args as MethodArgs<"withdraw_allocation">
        operation = contract.call(
          method,
          ...[
            new Address(withdrawAllocationArgs.tokenAddress).toScVal(),
            new Address(withdrawAllocationArgs.shareholder).toScVal(),
            nativeToScVal(withdrawAllocationArgs.amount, { type: "i128" }),
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
      case "list_shares":
        operation = contract.call(method)
        break
      case "get_config":
        operation = contract.call(method)
        break
      case "get_allocation":
        let getAllocationArgs = args as QueryArgs<"get_allocation">
        operation = contract.call(
          method,
          ...[
            new Address(getAllocationArgs.shareholderAddress).toScVal(),
            new Address(getAllocationArgs.tokenAddress).toScVal(),
          ]
        )
        break
      case "list_whitelisted_tokens":
        operation = contract.call(method)
        break
      case "get_unused_tokens":
        let getUnusedTokensArgs = args as QueryArgs<"get_unused_tokens">
        operation = contract.call(
          method,
          ...[new Address(getUnusedTokensArgs.tokenAddress).toScVal()]
        )
        break
      default:
        throw new Error("Invalid query method")
    }

    return this.processQuery(operation)
  }

  private decodeUpdateSharesParams(
    args: xdr.ScVal[]
  ): DecodeUpdateSharesResult {
    const shares = scValToNative(args[0])
    return {
      shares: shares.map((item: any) => {
        return {
          shareholder: item.shareholder.toString(),
          share: Number(BigInt(item.share)),
        }
      }),
    }
  }

  private decodeDistributeTokensParams(args: xdr.ScVal[]) {
    const [tokenAddress, amount] = scValToNative(args[0])
    return {
      tokenAddress,
      amount,
    }
  }

  private decodeTransferTokensParams(args: xdr.ScVal[]) {
    const [tokenAddress, recipient, amount] = scValToNative(args[0])
    return {
      tokenAddress: tokenAddress.toString(),
      recipient: recipient.toString(),
      amount: Number(BigInt(amount)),
    }
  }

  private decodeUpdateNameParams(args: xdr.ScVal[]) {
    const name = scValToNative(args[0])
    return {
      name: Buffer.from(name).toString("utf-8"),
    }
  }

  private decodeUpdateWhitelistedTokensParams(args: xdr.ScVal[]) {
    const tokens = scValToNative(args[0])
    return {
      tokens: tokens.map((item) => {
        return item.toString()
      }),
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
      case "init_splitter":
        throw new Error("Not implemented")
      case "update_shares":
        response.args = this.decodeUpdateSharesParams(args)
        break
      case "distribute_tokens":
        response.args = this.decodeDistributeTokensParams(args)
        break
      case "transfer_tokens":
        response.args = this.decodeTransferTokensParams(args)
        break
      case "update_name":
        response.args = this.decodeUpdateNameParams(args)
        break
      case "update_whitelisted_tokens":
        response.args = this.decodeUpdateWhitelistedTokensParams(args)
        break
      case "lock_contract":
        break
      default:
        throw new Error("Invalid transaction function!")
    }

    return response
  }
}

export default SplitterContract
