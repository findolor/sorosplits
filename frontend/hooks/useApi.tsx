import { useMemo } from "react"
import AuthenticationApiService from "../services/Authentication"
import SplitterApiService from "../services/Splitter"
import useAppStore from "../store"
import DeployerApiService from "@/services/Deployer"

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

  return { splitterApiService, authenticationApiService, deployerApiService }
}

export default useApiService
