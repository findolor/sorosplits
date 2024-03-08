import {
  Operation,
  SorobanRpc,
  TimeoutInfinite,
  Transaction,
  TransactionBuilder,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk"
import { getUserInfo, signTransaction } from "@stellar/freighter-api"
import CONFIG, { Network } from "../config"

export default class BaseContract {
  constructor(public network: Network, public walletAddress: string) {}

  private async initTxBuilder(publicKey: string, server: SorobanRpc.Server) {
    const source = await server.getAccount(publicKey)
    return new TransactionBuilder(source, {
      fee: "1000000",
      networkPassphrase: CONFIG[this.network].networkPhrase,
    })
  }

  protected getServer() {
    return new SorobanRpc.Server(CONFIG[this.network].rpcUrl, {
      allowHttp: true,
    })
  }

  public async sendTransaction(
    signedTx: string
  ): Promise<SorobanRpc.Api.SendTransactionResponse> {
    const server = this.getServer()
    let transaction = TransactionBuilder.fromXDR(
      signedTx,
      CONFIG[this.network].networkPhrase
    )
    return server.sendTransaction(transaction)
  }

  public async signTransaction(operation: xdr.Operation<Operation>) {
    const server = this.getServer()
    const userInfo = await getUserInfo()
    const txBuilder = await this.initTxBuilder(this.walletAddress, server)

    let tx: Transaction = txBuilder
      .addOperation(operation)
      .setTimeout(TimeoutInfinite)
      .build()

    let preparedTx = (await server.prepareTransaction(tx)) as Transaction

    let signedTx = await signTransaction(preparedTx.toXDR(), {
      network: CONFIG[this.network].network,
      networkPassphrase: CONFIG[this.network].networkPhrase,
      accountToSign: userInfo.publicKey,
    })

    return signedTx
  }

  public async getTransaction(
    transactionResponse: SorobanRpc.Api.SendTransactionResponse
  ): Promise<SorobanRpc.Api.GetTransactionResponse> {
    const server = this.getServer()
    let confirmation: SorobanRpc.Api.GetTransactionResponse
    let tries = 0

    do {
      if (tries > 20) {
        throw new Error("Transaction failed")
      }

      confirmation = await server.getTransaction(transactionResponse.hash)

      if (
        confirmation.status !== SorobanRpc.Api.GetTransactionStatus.NOT_FOUND
      ) {
        break
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))

      tries++
    } while (true)

    if (confirmation.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
      throw new Error("Transaction failed")
    }

    return confirmation
  }

  protected async processTransaction(
    operation: xdr.Operation<Operation>
  ): Promise<SorobanRpc.Api.GetTransactionResponse> {
    const signedTx = await this.signTransaction(operation)
    const transactionResponse = await this.sendTransaction(signedTx)
    return this.getTransaction(transactionResponse)
  }

  protected async processQuery(
    operation: xdr.Operation<Operation>
  ): Promise<any> {
    const server = this.getServer()
    const txBuilder = await this.initTxBuilder(
      CONFIG[this.network].adminWallet,
      this.getServer()
    )

    let tx: Transaction = txBuilder
      .addOperation(operation)
      .setTimeout(TimeoutInfinite)
      .build()

    let simulatedTx = await server.simulateTransaction(tx)

    if (SorobanRpc.Api.isSimulationError(simulatedTx)) {
      throw new Error("Query failed")
    }
    let response =
      simulatedTx as SorobanRpc.Api.SimulateTransactionSuccessResponse

    const scVal = response.result?.retval
    if (!scVal) throw new Error("Query failed")

    return scValToNative(scVal)
  }
}
