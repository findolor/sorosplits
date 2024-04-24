import { truncateAddressShort } from "@/utils/truncateAddress"
import Text from "../Text"
import Card from "./Card"
import Link from "next/link"
import Loading from "../Loading"
import Image from "next/image"

interface OwnedSplittersCardProps {
  loading: boolean
  data: {
    name: string
    address: string
  }[]
}

const OwnedSplittersCard: React.FC<OwnedSplittersCardProps> = ({
  loading,
  data,
}) => {
  return (
    <Card>
      <div className="flex justify-between">
        <Text
          text="Name"
          size="14"
          lineHeight="16"
          letterSpacing="-1.5"
          color="#687B8C"
        />
        <Text
          text="Address"
          size="14"
          lineHeight="16"
          letterSpacing="-1.5"
          color="#687B8C"
        />
      </div>
      <div className="w-[405px]">
        {loading ? (
          <Loading small />
        ) : (
          <div className="flex flex-col mt-3 gap-1">
            {data.length === 0 && (
              <div className="flex w-full gap-3">
                <Image
                  src="/icons/info.svg"
                  height={12}
                  width={12}
                  alt="Info icon"
                />
                <Text
                  text="You have not created any contracts yet."
                  size="12"
                  color="#687B8C"
                />
              </div>
            )}
            {data.map((item) => {
              return (
                <Link
                  key={item.address}
                  href={`/splitter/search?address=${item.address}`}
                >
                  <div className="h-[28px] rounded-[8px] flex justify-between items-center hover:bg-[#EBF2F7] hover:cursor-pointer p-4 px-2">
                    <Text
                      text={item.name}
                      size="12"
                      lineHeight="12"
                      letterSpacing="-1.5"
                    />
                    <Text
                      text={truncateAddressShort(item.address)}
                      size="12"
                      lineHeight="12"
                      letterSpacing="-1.5"
                    />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}

export default OwnedSplittersCard
