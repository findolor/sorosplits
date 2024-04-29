import React from "react"
import Wallet from "./Wallet"
import Image from "next/image"
import Link from "next/link"
import Text from "./Text"

const Navbar: React.FC = () => {
  return (
    <nav className="flex justify-between items-center h-16 px-6">
      <div className="flex items-center">
        <Link href="/">
          <Image src="/logo.svg" alt="Logo" height={80} width={140} />
        </Link>
        <Link href="/create" className="ml-10">
          <Text text="Create" size="15" lineHeight="20" letterSpacing="-2" />
        </Link>
        <Link href="/search" className="ml-6">
          <Text text="Search" size="15" lineHeight="20" letterSpacing="-2" />
        </Link>
      </div>
      <Wallet />
    </nav>
  )
}

export default Navbar
