import { useMemo } from "react"
import AuthenticationApiService from "../services/Authentication"
import SplitterApiService from "../services/Splitter"
import useAppStore from "../store"
import DeployerApiService from "@/services/Deployer"
import DiversifierApiService from "@/services/Diversifier"

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

  return {
    splitterApiService,
    authenticationApiService,
    deployerApiService,
    diversifierApiService,
  }
}

export default useApiService
