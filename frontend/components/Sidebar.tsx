import Button from "./Button"
import Wallet from "./Wallet"
import Link from "next/link"
import Image from "next/image"

const Sidebar = () => {
  return (
    <div className="min-h-screen h-full w-64 border-r-[1px] border-background-dark flex flex-col items-center justify-start py-6 px-0 gap-2 fixed">
      <Link href="/">
        <Image
          src="/logo.jpg"
          alt="SoroSplits"
          width={150}
          height={150}
          className="rounded-full mb-6 hover:opacity-90"
        />
      </Link>

      <Wallet />

      <Link href="/splitter/setup">
        <Button text="Setup Splitter" onClick={() => {}} type="outline" />
      </Link>

      <Link href="/splitter/search">
        <Button text="Search Splitter" onClick={() => {}} type="outline" />
      </Link>

      <Link
        href="https://github.com/findolor/sorosplit-contracts"
        target="_blank"
      >
        <Button text="Github Repo" onClick={() => {}} type="primary" />
      </Link>
    </div>
  )
}

export default Sidebar
