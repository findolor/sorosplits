import {
  Address,
  Contract,
  SorobanRpc,
  StrKey,
  nativeToScVal,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk"
import CONFIG, { Network } from "../config"
import BaseContract from "./Base"
import {
  ShareDataProps,
  DeployAndInitContractArgs as SplitterDeployAndInitContractArgs,
} from "./Splitter"
import { randomBytes } from "../utils/randomBytes"
import ba from "../utils/binascii"

export interface DiversifierDeployAndInitContractArgs
  extends SplitterDeployAndInitContractArgs {
  isDiversifierActive: boolean
}

export interface SplitterData {
  name: string
  shares: ShareDataProps[]
  updatable: boolean
}

export interface SplitterInputData {
  id: number
  share: number
}

export interface NetworkArg {
  id: number
  salt: Buffer
  isSplitter: boolean
  splitterData: SplitterData
  externalInputs: SplitterInputData[]
}

export interface DeployNetworkArgs {
  data: {
    id: number
    isSplitter: boolean
    splitterData: SplitterData
    externalInputs: SplitterInputData[]
  }[]
}

export interface DecodeArgs {
  xdrString: string
}

export class DeployerContract extends BaseContract {
  constructor(network: Network, walletAddress: string) {
    super(network, walletAddress)
  }

  public getDeployDiversifierOperation({
    name,
    shares,
    updatable,
    isDiversifierActive,
  }: DiversifierDeployAndInitContractArgs): xdr.Operation {
    const contract = new Contract(CONFIG[this.network].deployerContractId)

    let splitterInitArgs = [
      xdr.ScVal.scvBytes(Buffer.from(name, "utf-8")),
      xdr.ScVal.scvVec(
        shares.map((item) => {
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
    let diversifierInitArgs = [
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
      nativeToScVal(Buffer.from(randomBytes()), { type: "bytes" }),
      xdr.ScVal.scvBool(isDiversifierActive),
      xdr.ScVal.scvVec(splitterInitArgs),
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
      nativeToScVal(Buffer.from(randomBytes()), { type: "bytes" }),
      xdr.ScVal.scvVec(diversifierInitArgs),
    ]

    let operation = contract.call(
      "deploy_diversifier",
      ...diversifierDeployerArgs
    )
    return operation
  }

  public parseDeployedContractAddress(
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

  public getDeployNetworkOperation({ data }: DeployNetworkArgs): xdr.Operation {
    const contract = new Contract(CONFIG[this.network].deployerContractId)

    let args: NetworkArg[] = []

    for (let dataItem of data) {
      args.push({
        id: dataItem.id,
        salt: Buffer.from(randomBytes()),
        isSplitter: dataItem.isSplitter,
        splitterData: dataItem.splitterData,
        externalInputs: dataItem.externalInputs,
      })
    }

    const functionArgs = [
      // Deployer
      nativeToScVal(this.walletAddress, { type: "address" }),
      // Wasm hashes
      xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvSymbol("diversifier"),
          val: xdr.ScVal.scvBytes(
            Buffer.from(
              ba.unhexlify(CONFIG[this.network].diversifierWasmHash),
              "ascii"
            )
          ),
        }),
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvSymbol("splitter"),
          val: xdr.ScVal.scvBytes(
            Buffer.from(
              ba.unhexlify(CONFIG[this.network].splitterWasmHash),
              "ascii"
            )
          ),
        }),
      ]),
      // Args
      xdr.ScVal.scvVec(
        args.map((arg) => {
          return xdr.ScVal.scvMap([
            // ExternalInputs
            new xdr.ScMapEntry({
              key: xdr.ScVal.scvSymbol("external_inputs"),
              val: xdr.ScVal.scvVec(
                arg.externalInputs.map((item) => {
                  return xdr.ScVal.scvMap([
                    new xdr.ScMapEntry({
                      key: xdr.ScVal.scvSymbol("id"),
                      val: xdr.ScVal.scvU32(item.id),
                    }),
                    new xdr.ScMapEntry({
                      key: xdr.ScVal.scvSymbol("share"),
                      val: nativeToScVal(item.share, { type: "i128" }),
                    }),
                  ])
                })
              ),
            }),
            // ID
            new xdr.ScMapEntry({
              key: xdr.ScVal.scvSymbol("id"),
              val: xdr.ScVal.scvU32(arg.id),
            }),
            // IsSplitter
            new xdr.ScMapEntry({
              key: xdr.ScVal.scvSymbol("is_splitter"),
              val: xdr.ScVal.scvBool(arg.isSplitter),
            }),
            // Salt
            new xdr.ScMapEntry({
              key: xdr.ScVal.scvSymbol("salt"),
              val: xdr.ScVal.scvBytes(arg.salt),
            }),
            // SplitterData
            new xdr.ScMapEntry({
              key: xdr.ScVal.scvSymbol("splitter_data"),
              val: xdr.ScVal.scvMap([
                new xdr.ScMapEntry({
                  key: xdr.ScVal.scvSymbol("name"),
                  val: xdr.ScVal.scvBytes(
                    Buffer.from(arg.splitterData.name, "utf-8")
                  ),
                }),
                new xdr.ScMapEntry({
                  key: xdr.ScVal.scvSymbol("shares"),
                  val: xdr.ScVal.scvVec(
                    arg.splitterData.shares.map((item) => {
                      return xdr.ScVal.scvMap([
                        new xdr.ScMapEntry({
                          key: xdr.ScVal.scvSymbol("share"),
                          val: nativeToScVal(item.share, { type: "i128" }),
                        }),
                        new xdr.ScMapEntry({
                          key: xdr.ScVal.scvSymbol("shareholder"),
                          val: new Address(
                            item.shareholder.toString()
                          ).toScVal(),
                        }),
                      ])
                    })
                  ),
                }),
                new xdr.ScMapEntry({
                  key: xdr.ScVal.scvSymbol("updatable"),
                  val: xdr.ScVal.scvBool(arg.splitterData.updatable),
                }),
              ]),
            }),
          ])
        })
      ),
    ]

    return contract.call("deploy_network", ...functionArgs)
  }

  public async parseDeployedNetworkContractAddresses(
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
      let addresses: { id: number; address: string }[] = []
      const contractMap = txMeta.v3().sorobanMeta()?.returnValue().map()
      if (!contractMap) throw new Error("No contract map found")
      for (let item of contractMap) {
        const id = item.key().u32()
        const address = StrKey.encodeContract(item.val().address().contractId())
        addresses.push({ id, address })
      }
      return addresses
    } else throw new Error("Transaction failed")
  }

  private decodeDeployDiversifierParams(args: xdr.ScVal[]) {
    const deployArgs = scValToNative(args[3])
    const admin = deployArgs[0]
    const isDiversifierActive = deployArgs[3]
    const splitterArgs = deployArgs[4]
    const name = Buffer.from(splitterArgs[0]).toString("utf-8")
    const shares = splitterArgs[1].map((item: any) => {
      return {
        shareholder: item.shareholder.toString(),
        share: Number(BigInt(item.share)),
      }
    })
    const updatable = splitterArgs[2]
    return {
      admin,
      name,
      shares,
      updatable,
      isDiversifierActive,
    }
  }

  private decodeDeployNetworkParams(args: xdr.ScVal[]) {
    const admin = scValToNative(args[0])
    const networkArgs = scValToNative(args[2])
    const networkData = []
    for (let item of networkArgs) {
      networkData.push({
        admin,
        id: item.id,
        isSplitter: item.is_splitter,
        splitterData: {
          name: Buffer.from(item.splitter_data.name).toString("utf-8"),
          shares: item.splitter_data.shares.map((item: any) => {
            return {
              shareholder: item.shareholder.toString(),
              share: Number(BigInt(item.share)),
            }
          }),
          updatable: item.splitter_data.updatable,
        },
        externalInputs: item.external_inputs.map((item: any) => {
          return { id: item.id, share: Number(BigInt(item.share)) }
        }),
      })
    }
    return networkData
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
      case "deploy_splitter":
        throw new Error("Not implemented!")
      case "deploy_diversifier":
        response.args = this.decodeDeployDiversifierParams(args)
        break
      case "deploy_network":
        response.args = this.decodeDeployNetworkParams(args)
        break
      default:
        throw new Error("Invalid transaction function!")
    }

    return response
  }
}
