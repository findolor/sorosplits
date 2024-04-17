import React from "react"
import Text from "../Text"
import BaseModal from "./Modal"
import { ShareholderCardData } from "../SplitterData/Shareholders"
import { WhitelistedTokensCardData } from "../SplitterData/WhitelistedTokens"
import CreateSplitter from "../SplitterData/Create"

interface NetworkModalProps {
  isOpen: boolean
  title: string
  doneButtonOnClick: () => void
  resetButtonOnClick: () => void
  contractInfoData: {
    owner: string
    name: string
    updatable: boolean
    isDiversifierActive: boolean
  }
  onContractInfoCardUpdate: (
    name: string,
    updatable: boolean,
    isDiversifierActive: boolean
  ) => void
  shareholderCardData: ShareholderCardData[]
  preAllocation: number
  onShareholderCardUpdate: (data: ShareholderCardData[]) => void
  whitelistTokenCardData: WhitelistedTokensCardData[]
  onWhitelistedTokensCardUpdate: (data: WhitelistedTokensCardData[]) => void
  reset: number
}

const NetworkModal: React.FC<NetworkModalProps> = ({
  isOpen,
  title,
  doneButtonOnClick,
  resetButtonOnClick,
  contractInfoData,
  onContractInfoCardUpdate,
  shareholderCardData,
  preAllocation,
  onShareholderCardUpdate,
  whitelistTokenCardData,
  onWhitelistedTokensCardUpdate,
  reset,
}) => {
  return (
    <BaseModal
      size={1100}
      isOpen={isOpen}
      bgColor="#FBFBFB"
      onOutsideClick={doneButtonOnClick}
    >
      <Text
        text={title}
        size="22"
        lineHeight="28"
        letterSpacing="-2"
        bold
        centered
      />
      <CreateSplitter
        doneButtonOnClick={doneButtonOnClick}
        resetButtonOnClick={resetButtonOnClick}
        contractInfoData={contractInfoData}
        onContractInfoCardUpdate={onContractInfoCardUpdate}
        shareholderCardData={shareholderCardData}
        preAllocation={preAllocation}
        onShareholderCardUpdate={onShareholderCardUpdate}
        whitelistTokenCardData={whitelistTokenCardData}
        onWhitelistedTokensCardUpdate={onWhitelistedTokensCardUpdate}
        reset={reset}
      />
    </BaseModal>
  )
}

export default NetworkModal
