import { CallMethod } from "@sorosplits/sdk/lib/contracts/Splitter"
import Text from "../Text"
import Card from "./Card"

type Action = CallMethod | "deploy_splitter"

export interface SplitterContractActivity {
  action: Action
  createdAt: string
  data: Record<string, unknown>
}

interface ActivityCardProps {
  data: SplitterContractActivity[]
}

const ActivityCard: React.FC<ActivityCardProps> = ({ data }) => {
  const decodeAction = (action: Action) => {
    switch (action) {
      case "deploy_splitter":
      case "init_splitter":
        return "Splitter created"
      case "update_shares":
        return "Shareholders & shares are updated"
      case "distribute_tokens":
        return "Distributed tokens"
      case "lock_contract":
        return "Shareholders & shares are locked"
      case "transfer_tokens":
        return "Transferred unused tokens"
      case "update_name":
        return "Contract name updated"
      case "update_whitelisted_tokens":
        return "Whitelisted tokens updated"
    }
  }

  const formattedDate = (date: string) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    )
    let interval = seconds / 31536000

    if (interval > 1) {
      return Math.floor(interval) + " years ago"
    }
    interval = seconds / 2592000
    if (interval > 1) {
      return Math.floor(interval) + " months ago"
    }
    interval = seconds / 86400
    if (interval > 1) {
      return Math.floor(interval) + " days ago"
    }
    interval = seconds / 3600
    if (interval > 1) {
      return Math.floor(interval) + " hours ago"
    }
    interval = seconds / 60
    if (interval > 1) {
      return Math.floor(interval) + " minutes ago"
    }
    return Math.floor(seconds) + " seconds ago"
  }

  return (
    <Card width="423">
      <div className="flex justify-between">
        <Text
          text="Activity"
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
              className="h-[28px] w-[405px] rounded-[8px] flex justify-between items-center px-1 pr-4"
            >
              <Text
                text={decodeAction(item.action)}
                size="12"
                lineHeight="12"
                letterSpacing="-1.5"
                color="#46535F"
              />
              <Text
                text={formattedDate(item.createdAt)}
                size="12"
                lineHeight="12"
                letterSpacing="-1.5"
                color="#46535F"
              />
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default ActivityCard
