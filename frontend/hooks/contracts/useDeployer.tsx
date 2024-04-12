import {
  DeployNetworkArgs,
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
    deployNetwork,
  }
}

export default useDeployer
