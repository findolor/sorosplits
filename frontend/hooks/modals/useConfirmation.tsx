import ConfirmationModal from "@/components/Modal/ConfirmationModal"
import { useEffect, useState } from "react"

interface RenderModalProps {
  title: string
  message?: string
  onConfirm: () => void
}

const useModal = () => {
  const [confirmModal, setConfirmModal] = useState<[boolean, string]>([
    false,
    "",
  ])

  const onConfirmModal = (action: string) => {
    setConfirmModal([true, action])
  }

  const onCancelModal = () => {
    setConfirmModal([false, ""])
  }

  const RenderModal = ({ title, message, onConfirm }: RenderModalProps) => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setConfirmModal([false, ""])
      }
      if (event.key === "Enter") {
        onConfirm()
      }
    }

    useEffect(() => {
      window.addEventListener("keydown", handleKeyDown)

      return () => {
        window.removeEventListener("keydown", handleKeyDown)
      }
    }, [])

    return (
      <ConfirmationModal
        title={title}
        message={message}
        isOpen={confirmModal[0]}
        onCancel={onCancelModal}
        onConfirm={onConfirm}
      />
    )
  }

  return {
    confirmModal,
    onConfirmModal,
    onCancelModal,
    RenderModal,
  }
}

export default useModal
