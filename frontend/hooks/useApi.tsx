import { useMemo } from "react"
import AuthenticationApiService from "../services/Authentication"
import SplitterApiService from "../services/Splitter"
import useAppStore from "../store"
import DeployerApiService from "@/services/Deployer"
import DiversifierApiService from "@/services/Diversifier"
import ContractApiService from "@/services/Contract"
import TokenApiService from "@/services/Token"

const useApiService = () => {
  const { accessToken } = useAppStore()

  const splitterApiService = useMemo(() => {
    return new SplitterApiService(accessToken as string)
  }, [accessToken])

  const authenticationApiService = useMemo(() => {
    return new AuthenticationApiService()
  }, [])

  const deployerApiService = useMemo(() => {
    return new DeployerApiService(accessToken as string)
  }, [accessToken])

  const diversifierApiService = useMemo(() => {
    return new DiversifierApiService(accessToken as string)
  }, [accessToken])

  const contractApiService = useMemo(() => {
    return new ContractApiService(accessToken as string)
  }, [accessToken])

  const tokenApiService = useMemo(() => {
    return new TokenApiService(accessToken as string)
  }, [accessToken])

  return {
    splitterApiService,
    authenticationApiService,
    deployerApiService,
    diversifierApiService,
    contractApiService,
    tokenApiService,
  }
}

export default useApiService
