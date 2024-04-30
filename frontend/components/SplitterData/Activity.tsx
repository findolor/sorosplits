import { CallMethod as SplitterCallMethod } from "sorosplits-sdk/lib/contracts/Splitter"
import { CallMethod as DiversifierCallMethod } from "sorosplits-sdk/lib/contracts/Diversifier"
import Text from "../Text"
import Card from "./Card"
import { truncateAddressLong } from "@/utils/truncateAddress"

type Action =
  | SplitterCallMethod
  | DiversifierCallMethod
  | "deploy_splitter"
  | "deploy_network"
  | "deploy_diversifier"

export interface SplitterContractActivity {
  action: Action
  createdAt: string
  data: Record<string, unknown>
}

interface ActivityCardProps {
  data: SplitterContractActivity[]
}

const ActivityCard: React.FC<ActivityCardProps> = ({ data }) => {
  const decodeAction = (action: Action, data: Record<string, any>) => {
    switch (action) {
      case "deploy_splitter":
      case "init_splitter":
        return "Contract creation"
      case "deploy_diversifier":
      case "init_diversifier":
        return "Contract creation"
      case "update_shares":
        return "Shareholders & shares update"
      case "distribute_tokens":
        return `Token distribution - ${truncateAddressLong(
          data["tokenAddress"]
        )}`
      case "lock_contract":
        return "Shareholders & shares locke"
      case "transfer_tokens":
        return "Unused tokens transfer"
      case "update_name":
        return "Contract name update"
      case "update_whitelisted_tokens":
        return "Whitelisted tokens update"
      case "deploy_network":
        return "Network contract creation"
      case "toggle_diversifier":
        return "Diversifier state update"
      case "update_whitelisted_swap_tokens":
        return "Whitelisted swap tokens update"
      case "withdraw_allocation":
        return `Allocation withdrawal - ${truncateAddressLong(
          data["shareholder"]
        )}`
      default:
        return action
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
    <Card>
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
              className="h-[28px] w-full rounded-[8px] flex justify-between items-center px-1 pr-4 cursor-pointer"
              data-tooltip-id="hover-tooltip"
              data-tooltip-html={JSON.stringify(item.data, null, 2).replace(
                /\n/g,
                "<br>"
              )}
            >
              <Text
                text={decodeAction(item.action, item.data)}
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
