import { truncateAddressLong } from "@/utils/truncateAddress"
import Text from "../Text"
import Card from "./Card"

interface ShareholdersCardProps {
  data: {
    address: string
    share: string
    domain: boolean
  }[]
}

const ShareholdersCard: React.FC<ShareholdersCardProps> = ({ data }) => {
  return (
    <Card width="437">
      <div className="flex justify-between">
        <Text
          text={"Shareholders (" + data.length + ")"}
          size="14"
          lineHeight="16"
          letterSpacing="-1.5"
          color="#687B8C"
        />
        <Text
          text="Share"
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
              className="h-[28px] w-[405px] rounded-[8px] flex justify-between items-center px-1"
            >
              <Text
                text={
                  item.domain ? item.address : truncateAddressLong(item.address)
                }
                size="12"
                lineHeight="12"
                letterSpacing="-1.5"
              />
              <Text
                text={item.share + "%"}
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

export default ShareholdersCard
