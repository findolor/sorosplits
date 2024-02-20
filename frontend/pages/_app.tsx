import "../styles/globals.css"
import Layout from "../components/Layout"
import type { AppProps } from "next/app"
import { Toaster } from "react-hot-toast"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            backgroundColor: "#F7F6E9",
            border: "2px solid #deddd1",
          },
        }}
      />
    </Layout>
  )
}
