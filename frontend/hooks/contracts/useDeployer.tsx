import {
  DeployNetworkArgs,
  DiversifierDeployAndInitContractArgs,
  SplitterData,
  SplitterInputData,
} from "@sorosplits/sdk/lib/contracts/Deployer"
import useContracts from "./useContracts"
import useApiService from "../useApi"

export interface NetworkItemProps {
  id: number
  isSplitter: boolean
  data: SplitterData
  externalInputs: SplitterInputData[]
}

const useDeployer = () => {
  const { deployerContract } = useContracts()
  const { deployerApiService } = useApiService()

  const deployDiversifier = async ({
    name,
    shares,
    updatable,
    isDiversifierActive,
  }: DiversifierDeployAndInitContractArgs) => {
    const operation = deployerContract.getDeployDiversifierOperation({
      name,
      shares,
      updatable,
      isDiversifierActive,
    })
    const signedTx = await deployerContract.signTransaction([operation])
    const contractAddress = await deployerApiService.deployDiversifier({
      transaction: signedTx,
    })
    return contractAddress
  }

  const deployNetwork = async (networkItems: NetworkItemProps[]) => {
    let args: DeployNetworkArgs = {
      data: [],
    }

    for (let networkItem of networkItems) {
      args.data.push({
        id: networkItem.id,
        isSplitter: networkItem.isSplitter,
        splitterData: networkItem.data,
        externalInputs: networkItem.externalInputs,
      })
    }

    let operation = deployerContract.getDeployNetworkOperation(args)
    let signedTx = await deployerContract.signTransaction([operation])
    const contracts = await deployerApiService.deployNetwork({
      transaction: signedTx,
    })
    return contracts
  }

  return {
    deployDiversifier,
    deployNetwork,
  }
}

export default useDeployer
