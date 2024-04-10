import Text from "@/components/Text"
import useAppStore from "../store"
import Wallet from "@/components/Wallet"
import OwnedSplittersCard from "@/components/SplitterData/OwnedSplitters"
import PinnedSplittersCard from "@/components/SplitterData/PinnedSplitters"
import {
  CreateSplitterButton,
  SearchSplitterButton,
} from "@/components/Button/Splitter"
import Link from "next/link"
import useApiService from "@/hooks/useApi"
import { useEffect, useState } from "react"
import { SplitterResponseProps } from "@/services/Splitter"
import Layout from "@/components/Layout"

export default function Home() {
  const { isConnected } = useAppStore()
  const { splitterApiService } = useApiService()

  const [ownedSplitters, setOwnedSplitters] =
    useState<SplitterResponseProps[]>()
  const [ownedSplittersLoading, setOwnedSplittersLoading] = useState(true)
  const [pinnedSplitters, setPinnedSplitters] =
    useState<SplitterResponseProps[]>()
  const [pinnedSplittersLoading, setPinnedSplittersLoading] = useState(true)

  useEffect(() => {
    const fetchOwnedSplitters = async () => {
      setOwnedSplittersLoading(true)
      const data = await splitterApiService.getOwnedSplitters()
      setOwnedSplitters(data)
      setOwnedSplittersLoading(false)
    }

    const fetchPinnedSplitters = async () => {
      setPinnedSplittersLoading(true)
      const data = await splitterApiService.getPinnedSplitters()
      setPinnedSplitters(data)
      setPinnedSplittersLoading(false)
    }

    if (isConnected) {
      fetchOwnedSplitters()
      fetchPinnedSplitters()
    }
  }, [isConnected])

  return (
    <Layout>
      <div className="flex flex-col items-center pt-10">
        <Text
          text="Welcome to SoroSplits"
          size="28"
          lineHeight="32"
          letterSpacing="-2"
          bold
        />
        <div className="mt-6 mb-12 px-44">
          <Text
            text="SoroSplits is a set of smart contracts & interfaces to enable split transactions and revenue sharing across multiple parties in the Stellar ecosystem."
            size="15"
            lineHeight="20"
            letterSpacing="-2"
            color="#46535F"
            centered
          />
        </div>
        {!isConnected && <Wallet />}
        {isConnected && (
          <div>
            <div className="flex justify-between gap-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Text
                    text="Owned Splitters"
                    size="20"
                    lineHeight="24"
                    letterSpacing="-2"
                    bold
                  />
                  <Link href="/splitter/create">
                    <CreateSplitterButton />
                  </Link>
                </div>
                <OwnedSplittersCard
                  loading={ownedSplittersLoading}
                  data={ownedSplitters ? ownedSplitters : []}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Text
                    text="Pinned Splitters"
                    size="20"
                    lineHeight="24"
                    letterSpacing="-2"
                    bold
                  />
                  <Link href="/splitter/search">
                    <SearchSplitterButton />
                  </Link>
                </div>
                <PinnedSplittersCard
                  loading={pinnedSplittersLoading}
                  data={pinnedSplitters ? pinnedSplitters : []}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
