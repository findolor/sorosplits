import { ReactNode } from "react"
import Sidebar from "./Sidebar"

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex justify-center">
      <div className="container flex">
        <Sidebar />
        <main className="pl-[304px] py-6 w-full">{children}</main>
      </div>
    </div>
  )
}

export default Layout
