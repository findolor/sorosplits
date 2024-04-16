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
          <button>
            <Image src="/logo.svg" alt="Logo" height={80} width={80} />
          </button>
        </Link>
        <Link href="/splitter/create" className="ml-10">
          <button>
            <Text text="Create" size="15" lineHeight="20" letterSpacing="-2" />
          </button>
        </Link>
        <Link href="/splitter/search" className="ml-6">
          <button>
            <Text text="Search" size="15" lineHeight="20" letterSpacing="-2" />
          </button>
        </Link>
        <Link href="/network" className="ml-6">
          <button>
            <Text
              text="Create Network"
              size="15"
              lineHeight="20"
              letterSpacing="-2"
            />
          </button>
        </Link>
      </div>
      <Wallet />
    </nav>
  )
}

export default Navbar
