import { truncateAddressLong } from "@/utils/truncateAddress"
import Text from "../Text"
import Card from "./Card"

interface PinnedSplittersCardProps {
  data: {
    name: string
    address: string
  }[]
}

const PinnedSplittersCard: React.FC<PinnedSplittersCardProps> = ({ data }) => {
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
      <div className="flex flex-col mt-3 gap-1">
        {data.map((item, index) => {
          return (
            <div
              key={index.toString()}
              className="h-[28px] w-[405px] rounded-[8px] flex justify-between items-center p-4 px-2"
            >
              <Text
                text={item.name}
                size="12"
                lineHeight="12"
                letterSpacing="-1.5"
              />
              <Text
                text={truncateAddressLong(item.address)}
                size="12"
                lineHeight="12"
                letterSpacing="-1.5"
              />
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default PinnedSplittersCard
