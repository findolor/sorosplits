import {
  CreateSplitterDoneButton,
  CreateSplitterResetButton,
} from "../Button/Splitter"
import ContractInfoCard from "./ContractInfo"
import ShareholdersCard, { ShareholderCardData } from "./Shareholders"
import WhitelistedTokensCard, {
  WhitelistedTokensCardData,
} from "./WhitelistedTokens"

interface CreateSplitterProps {
  doneButtonOnClick: () => void
  resetButtonOnClick: () => void
  contractInfoData: {
    owner: string
    name: string
    updatable: boolean
  }
  onContractInfoCardUpdate: (name: string, updatable: boolean) => void
  shareholderCardData: ShareholderCardData[]
  onShareholderCardUpdate: (data: ShareholderCardData[]) => void
  whitelistTokenCardData: WhitelistedTokensCardData[]
  onWhitelistedTokensCardUpdate: (data: WhitelistedTokensCardData[]) => void
  reset: number
}

const CreateSplitter = ({
  doneButtonOnClick,
  resetButtonOnClick,
  contractInfoData,
  onContractInfoCardUpdate,
  shareholderCardData,
  onShareholderCardUpdate,
  whitelistTokenCardData,
  onWhitelistedTokensCardUpdate,
  reset,
}: CreateSplitterProps) => {
  return (
    <div className="flex flex-col justify-between px-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <CreateSplitterDoneButton onClick={doneButtonOnClick} />
        </div>
        <CreateSplitterResetButton onClick={resetButtonOnClick} />
      </div>

      <div className="flex justify-between w-full gap-4">
        <div className="flex flex-col gap-4 w-[560px]">
          <ShareholdersCard
            data={shareholderCardData}
            onUpdate={onShareholderCardUpdate}
            edit={true}
            reset={reset}
          />

          <WhitelistedTokensCard
            contractAddress={""}
            data={whitelistTokenCardData}
            onUpdate={onWhitelistedTokensCardUpdate}
            edit={true}
            reset={reset}
            create
          />
        </div>

        <div className="flex flex-col gap-4 w-[423px]">
          <ContractInfoCard
            data={contractInfoData}
            totalDistributionsData={[]}
            onUpdate={onContractInfoCardUpdate}
            edit={true}
            reset={reset}
            create
          />
        </div>
      </div>
    </div>
  )
}

export default CreateSplitter
