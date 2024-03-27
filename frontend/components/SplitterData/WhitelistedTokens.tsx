import Text from "../Text"
import Card from "./Card"

interface WhitelistedTokensCardProps {
  data: {
    name: string
    symbol: string
    decimals: number
  }[]
}

const WhitelistedTokensCard: React.FC<WhitelistedTokensCardProps> = ({
  data,
}) => {
  return (
    <Card width="560">
      <div className="flex justify-between">
        <Text
          text="Whitelisted Tokens"
          size="14"
          lineHeight="16"
          letterSpacing="-1.5"
          color="#687B8C"
        />
        <div className="flex items-center gap-4">
          <Text
            text="Symbol"
            size="14"
            lineHeight="16"
            letterSpacing="-1.5"
            color="#687B8C"
          />
          <Text
            text="Decimal"
            size="14"
            lineHeight="16"
            letterSpacing="-1.5"
            color="#687B8C"
          />
        </div>
      </div>
      <div className="flex flex-col mt-3 gap-1">
        {data.map((item, index) => {
          return (
            <div
              key={index.toString()}
              className="h-[28px] w-full rounded-[8px] flex justify-between items-center px-1"
            >
              <Text
                text={item.name}
                size="12"
                lineHeight="12"
                letterSpacing="-1.5"
              />
              <div className="flex items-center">
                <Text
                  text={item.symbol}
                  size="12"
                  lineHeight="12"
                  letterSpacing="-1.5"
                />
                <div className="w-[50px] ml-5 flex justify-end">
                  <Text
                    text={item.decimals.toString()}
                    size="12"
                    lineHeight="12"
                    letterSpacing="-1.5"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default WhitelistedTokensCard
