import useApiService from "@/hooks/useApi"
import "../styles/globals.css"

import type { AppProps } from "next/app"
import { useEffect } from "react"
import { Toaster } from "react-hot-toast"
import useAppStore, { TokenListItem } from "../store"
import { Tooltip } from "react-tooltip"

export default function App({ Component, pageProps }: AppProps) {
  const { tokenList, setTokenList } = useAppStore()
  const { tokenApiService } = useApiService()

  useEffect(() => {
    if (tokenList.length > 0) return
    const fetch = async () => {
      const data = (await tokenApiService.getTokenList()) as TokenListItem[]
      setTokenList(data)
    }
    fetch()
  }, [])

  return (
    <div>
      <Component {...pageProps} />
      <Tooltip id="click-tooltip" openOnClick={true} />
      <Tooltip id="hover-tooltip" />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            backgroundColor: "#FBFBFB",
            color: "#687B8C",
            border: "1px solid #EBF2F7",
            fontSize: "14px",
          },
        }}
        containerStyle={{
          top: 10,
        }}
      />
    </div>
  )
}
