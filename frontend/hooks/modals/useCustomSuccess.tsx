import CustomSuccessModal from "@/components/Modal/CustomSuccessModal"
import { useState } from "react"

interface RenderModalProps {
  onConfirm: () => void
  contractAddresses: {
    splitter: string
    diversifier: string
  }
}

const useModal = () => {
  const [isOpen, setIsOpen] = useState(false)

  const RenderModal = ({ contractAddresses, onConfirm }: RenderModalProps) => {
    return (
      <CustomSuccessModal
        isOpen={isOpen}
        onConfirm={onConfirm}
        contractAddresses={contractAddresses}
      />
    )
  }

  return {
    setIsOpen,
    RenderModal,
  }
}

export default useModal
