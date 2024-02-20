import {
  Operation,
  SorobanRpc,
  TimeoutInfinite,
  Transaction,
  TransactionBuilder,
  scValToNative,
  xdr,
} from "stellar-sdk"
import { config } from "../utils/config"
import { getUserInfo, signTransaction } from "@stellar/freighter-api"

class BaseContract {
  constructor(public walletAddress: string) {}

  private async initTxBuilder(publicKey: string, server: SorobanRpc.Server) {
    const source = await server.getAccount(publicKey)
    return new TransactionBuilder(source, {
      fee: "1000000",
      networkPassphrase: config.networkPhrase,
    })
  }

  private getServer() {
    return new SorobanRpc.Server(config.rpcUrl, {
      allowHttp: process.env.NODE_ENV !== "production",
    })
  }

  private async sendTransaction(
    server: SorobanRpc.Server,
    operation: xdr.Operation<Operation>
  ): Promise<SorobanRpc.Api.SendTransactionResponse> {
    const userInfo = await getUserInfo()
    const txBuilder = await this.initTxBuilder(
      this.walletAddress,
      this.getServer()
    )

    let tx: Transaction = txBuilder
      .addOperation(operation)
      .setTimeout(TimeoutInfinite)
      .build()

    let preparedTx = (await server.prepareTransaction(tx)) as Transaction

    let signedTx = await signTransaction(preparedTx.toXDR(), {
      network: config.network,
      networkPassphrase: config.networkPhrase,
      accountToSign: userInfo.publicKey,
    })

    let transaction = TransactionBuilder.fromXDR(signedTx, config.networkPhrase)

    return server.sendTransaction(transaction)
  }

  private async getTransaction(
    server: SorobanRpc.Server,
    transactionResponse: SorobanRpc.Api.SendTransactionResponse
  ): Promise<SorobanRpc.Api.GetTransactionResponse> {
    let confirmation
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
    const server = this.getServer()

    const transactionResponse = await this.sendTransaction(server, operation)
    console.log(transactionResponse)
    return this.getTransaction(server, transactionResponse)
  }

  protected async processQuery(operation: xdr.Operation<Operation>): Promise<any> {
    const server = this.getServer()
    const txBuilder = await this.initTxBuilder(
      this.walletAddress,
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

export default BaseContract
