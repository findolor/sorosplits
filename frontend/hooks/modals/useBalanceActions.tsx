import BalanceActionsModal, { Action } from "@/components/Modal/BalanceActions"
import { useState } from "react"

interface RenderModalProps {
  title: string
  message?: string
  onConfirm: (action: Action, data: Record<string, any>) => void
  isAdmin: boolean
  maxAmounts: {
    allocation: number
    unused: number
  }
  isDiversifierActive: boolean
}

const useModal = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleModal = (state: boolean) => {
    setIsOpen(state)
  }

  const RenderModal = ({
    title,
    message,
    onConfirm,
    isAdmin,
    maxAmounts,
    isDiversifierActive,
  }: RenderModalProps) => {
    return (
      <BalanceActionsModal
        title={title}
        message={message}
        isOpen={isOpen}
        onCancel={() => setIsOpen(false)}
        onConfirm={onConfirm}
        isAdmin={isAdmin}
        maxAmounts={maxAmounts}
        isDiversifierActive={isDiversifierActive}
      />
    )
  }

  return {
    RenderModal,
    toggleModal,
  }
}

export default useModal
