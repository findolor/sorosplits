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
import { ShareDataProps } from "./Splitter"
import { randomBytes } from "../utils/randomBytes"
import ba from "../utils/binascii"

export interface SplitterDeployAndInitContractArgs {
  name: string
  shares: ShareDataProps[]
  updatable: boolean
}

export interface DiversifierDeployAndInitContractArgs
  extends SplitterDeployAndInitContractArgs {
  isDiversifierActive: boolean
}

export interface SplitterData {
  name: string
  shares: ShareDataProps[]
  updatable: boolean
}

export interface OutputContractData {
  id: number
  share: number
}

export interface NetworkArg {
  id: number
  salt: Buffer
  isDiversifierActive: boolean
  splitterData: SplitterData
  outputContracts: OutputContractData[]
}

export interface DeployNetworkArgs {
  data: NetworkArg[]
}

export interface DecodeArgs {
  xdrString: string
}

export class DeployerContract extends BaseContract {
  constructor(network: Network, walletAddress: string) {
    super(network, walletAddress)
  }

  public getDeployAndInitOperation({
    name,
    shares,
    updatable,
  }: SplitterDeployAndInitContractArgs): xdr.Operation {
    const contract = new Contract(CONFIG[this.network].deployerContractId)

    let splitterArgs = [
      new Address(this.walletAddress || "").toScVal(),
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
      nativeToScVal(Buffer.from(randomBytes()), { type: "bytes" }),
      xdr.ScVal.scvVec(splitterArgs),
    ]

    let operation = contract.call("deploy_splitter", ...deployerArgs)
    return operation
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
        isDiversifierActive: dataItem.isDiversifierActive,
        splitterData: dataItem.splitterData,
        outputContracts: dataItem.outputContracts,
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
            // ID
            new xdr.ScMapEntry({
              key: xdr.ScVal.scvSymbol("id"),
              val: xdr.ScVal.scvU32(arg.id),
            }),
            // IsSplitter
            new xdr.ScMapEntry({
              key: xdr.ScVal.scvSymbol("is_diversifier_active"),
              val: xdr.ScVal.scvBool(arg.isDiversifierActive),
            }),
            // OutputContracts
            new xdr.ScMapEntry({
              key: xdr.ScVal.scvSymbol("output_contracts"),
              val: xdr.ScVal.scvVec(
                arg.outputContracts.map((item) => {
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

  private decodeDeploySplitterParams(args: xdr.ScVal[]) {
    const [admin, name, shares, updatable] = scValToNative(
      xdr.ScVal.scvVec([args[3]])
    )[0]
    return {
      admin,
      name: Buffer.from(name).toString("utf-8"),
      shares: shares.map((item: any) => {
        return {
          shareholder: item.shareholder.toString(),
          share: Number(BigInt(item.share)),
        }
      }),
      updatable,
    }
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
        outputContracts: item.output_contracts.map((item: any) => {
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
        response.args = this.decodeDeploySplitterParams(args)
        break
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
