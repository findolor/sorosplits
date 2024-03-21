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
      <Navbar />
      <main className="max-w-4xl mx-auto">{children}</main>
    </div>
  )
}

export default NewLayout
