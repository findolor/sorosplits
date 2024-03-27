import "../styles/globals.css"

import Layout from "@/components/NewLayout"
import type { AppProps } from "next/app"
import { Toaster } from "react-hot-toast"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
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
    </Layout>
  )
}
