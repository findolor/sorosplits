import React from "react"
import Navbar from "./Navbar"
import { Radio_Canada } from "next/font/google"

interface NewLayoutProps {
  children: React.ReactNode
}

const radioCanada = Radio_Canada({ subsets: ["latin"] })

const NewLayout: React.FC<NewLayoutProps> = ({ children }) => {
  return (
    <div className={radioCanada.className}>
      <div className="max-w-[1024px] mx-auto">
        <Navbar />
      </div>
      <div className="h-[1px] bg-[#EBF2F7]" />
      <main className="max-w-[1024px] mx-auto">{children}</main>
    </div>
  )
}

export default NewLayout
