import useApiService from "@/hooks/useApi"
import "../styles/globals.css"

import type { AppProps } from "next/app"
import { useEffect, useState } from "react"
import { Toaster } from "react-hot-toast"
import useAppStore, { TokenListItem } from "../store"
import { Tooltip } from "react-tooltip"
import Text from "@/components/Text"
import Image from "next/image"

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

  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false)
  useEffect(() => {
    function handleResize() {
      setIsMobileOrTablet(window.innerWidth <= 1024)
    }

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Call handler right away so state gets updated with initial window size
    handleResize()

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (isMobileOrTablet) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 relative">
        <div className="flex flex-col absolute top-[10em] gap-2 px-[5em]">
          <Text
            text="Sorosplits is not available on mobile devices."
            size="15"
            lineHeight="20"
            centered
          />
          <Text
            text="Please visit us on your desktop to use the app."
            size="15"
            lineHeight="20"
            centered
          />
        </div>
        <div className="absolute">
          <Image src="/logo.svg" alt="Logo" width={205} height={10} />
        </div>
      </div>
    )
  }

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
            wordBreak: "break-all",
          },
        }}
        containerStyle={{
          top: 10,
        }}
      />
    </div>
  )
}
