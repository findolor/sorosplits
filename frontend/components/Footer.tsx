import Image from "next/image"
import Link from "next/link"
import Wallet from "./Wallet"
import Text from "./Text"

const Footer = () => {
  return (
    <footer className="h-[207px] w-full flex items-end bg-black py-10 relative">
      <div className="absolute flex w-full items-center justify-center h-8">
        <Link href="https://github.com/findolor/sorosplits" target="_blank">
          <Image
            src="/icons/github.svg"
            alt="Github Logo"
            width={20}
            height={10}
          />
        </Link>
      </div>
      <div className="flex w-full justify-between px-16">
        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-4">
            <Link href="/create">
              <Text
                text="Create"
                size="15"
                lineHeight="20"
                letterSpacing="-2"
                color="white"
              />
            </Link>
            <Link href="/search">
              <Text
                text="Search"
                size="15"
                lineHeight="20"
                letterSpacing="-2"
                color="white"
              />
            </Link>
          </div>
        </div>
        <div className="flex justify-end items-end">
          <Image src="/logo-white.svg" alt="Logo" width={150} height={10} />
        </div>
      </div>
    </footer>
  )
}

export default Footer
