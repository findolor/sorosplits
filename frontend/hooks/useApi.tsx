import { useMemo } from "react"
import AuthenticationApiService from "../services/Authentication"
import SplitterApiService from "../services/Splitter"
import useAppStore from "../store"

const useApiService = () => {
  const { accessToken } = useAppStore()

  const splitterApiService = useMemo(() => {
    return new SplitterApiService(accessToken as string)
  }, [accessToken])

  const authenticationApiService = useMemo(() => {
    return new AuthenticationApiService()
  }, [])

  return { splitterApiService, authenticationApiService }
}

export default useApiService
