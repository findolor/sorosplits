import CustomSuccessModal, {
  SuccessContractDetails,
} from "@/components/Modal/CustomSuccessModal"
import { useState } from "react"

interface RenderModalProps {
  onDownload: () => void
  onConfirm: () => void
  contracts: SuccessContractDetails[]
}

const useModal = () => {
  const [isOpen, setIsOpen] = useState(false)

  const RenderModal = ({
    contracts,
    onDownload,
    onConfirm,
  }: RenderModalProps) => {
    return (
      <CustomSuccessModal
        isOpen={isOpen}
        onDownload={onDownload}
        onConfirm={onConfirm}
        contracts={contracts}
      />
    )
  }

  return {
    setIsOpen,
    RenderModal,
  }
}

export default useModal
