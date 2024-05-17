import { useEffect, useState } from "react"
import { Network } from "../../config"
import {
  DeployerContract,
  SplitterDeployAndInitContractArgs,
  DiversifierDeployAndInitContractArgs,
  DeployNetworkArgs,
} from "../../contracts/Deployer"
import { checkFreighterConnection } from "../helper"

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

  const deployAndInitSplitter = async ({
    name,
    shares,
    updatable,
  }: SplitterDeployAndInitContractArgs) => {
    await checkFreighterConnection()
    return deployerContract.getDeployAndInitOperation({
      name,
      shares,
      updatable,
    })
  }

  const deployDiversifier = async ({
    name,
    shares,
    updatable,
    isDiversifierActive,
  }: DiversifierDeployAndInitContractArgs) => {
    await checkFreighterConnection()
    return deployerContract.getDeployDiversifierOperation({
      name,
      shares,
      updatable,
      isDiversifierActive,
    })
  }

  const deployNetwork = async ({ data }: DeployNetworkArgs) => {
    await checkFreighterConnection()
    return deployerContract.getDeployNetworkOperation({ data })
  }

  return {
    deployAndInitSplitter,
    deployDiversifier,
    deployNetwork,
  }
}
