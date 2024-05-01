import React from "react"
import Navbar from "./Navbar"
import { Radio_Canada } from "next/font/google"
import Footer from "./Footer"

interface LayoutProps {
  children: React.ReactNode
  full?: boolean
}

const radioCanada = Radio_Canada({ subsets: ["latin"] })

const Layout: React.FC<LayoutProps> = ({ children, full = undefined }) => {
  return (
    <div
      className={`${radioCanada.className} flex flex-col justify-between min-h-screen`}
    >
      <div className="flex flex-col">
        <div className="sticky top-0 z-10">
          <div className="max-w-[1024px] mx-auto bg-[#FBFBFB]">
            <Navbar />
          </div>
          <div className="h-[1px] bg-[#EBF2F7]" />
        </div>
        <main
          className={`${
            full ? "w-screen px-10" : "max-w-[1024px]"
          } mx-auto pb-10`}
        >
          {children}
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default Layout
