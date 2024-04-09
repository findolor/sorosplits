import React from "react"
import Navbar from "./Navbar"
import { Radio_Canada } from "next/font/google"

interface LayoutProps {
  children: React.ReactNode
  full?: boolean
}

const radioCanada = Radio_Canada({ subsets: ["latin"] })

const Layout: React.FC<LayoutProps> = ({ children, full = undefined }) => {
  return (
    <div className={radioCanada.className}>
      <div className="sticky top-0 z-10">
        <div className="max-w-[1024px] mx-auto bg-[#FBFBFB]">
          <Navbar />
        </div>
        <div className="h-[1px] bg-[#EBF2F7]" />
      </div>
      <main
        className={`${
          full ? "max-w-[1440px]" : "max-w-[1024px]"
        } mx-auto pb-16`}
      >
        {children}
      </main>
    </div>
  )
}

export default Layout
