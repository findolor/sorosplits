import { useEffect, useState } from "react"
import { Network } from "../../config"
import {
  DeployerContract,
  SplitterDeployAndInitContractArgs,
  DiversifierDeployAndInitContractArgs,
  DeployNetworkArgs,
} from "../../contracts/Deployer"
import { checkFreighterConnection } from "../helper"
import { xdr } from "@stellar/stellar-sdk"

export const useDeployerContract = (
  network: Network,
  walletAddress: string
) => {
  const [deployerContract, setDeployerContract] = useState<DeployerContract>(
    new DeployerContract(network, walletAddress)
  )

  useEffect(() => {
    const deployerContract = new DeployerContract(network, walletAddress)
    setDeployerContract(deployerContract)
  }, [walletAddress])

  const processTransaction = async (op: xdr.Operation) => {
    const signedTx = await deployerContract.signTransaction([op])
    const txResponse = await deployerContract.sendTransaction(signedTx)
    return deployerContract.getTransaction(txResponse)
  }

  const deployAndInitSplitter = async ({
    name,
    shares,
    updatable,
  }: SplitterDeployAndInitContractArgs) => {
    await checkFreighterConnection()
    return processTransaction(
      deployerContract.getDeployAndInitOperation({
        name,
        shares,
        updatable,
      })
    )
  }

  const deployDiversifier = async ({
    name,
    shares,
    updatable,
    isDiversifierActive,
  }: DiversifierDeployAndInitContractArgs) => {
    await checkFreighterConnection()
    return processTransaction(
      deployerContract.getDeployDiversifierOperation({
        name,
        shares,
        updatable,
        isDiversifierActive,
      })
    )
  }

  const deployNetwork = async ({ data }: DeployNetworkArgs) => {
    await checkFreighterConnection()
    return processTransaction(
      deployerContract.getDeployNetworkOperation({ data })
    )
  }

  return {
    deployAndInitSplitter,
    deployDiversifier,
    deployNetwork,
  }
}
