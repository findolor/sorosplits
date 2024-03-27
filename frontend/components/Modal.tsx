import React from "react"
import { ConfirmButton, CancelButton } from "./Button/Modal"
import Text from "./Text"

interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  message?: string
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center">
      <div className="w-[305px] flex flex-col justify-center items-center bg-white p-6 rounded-lg shadow-lg gap-4">
        <Text
          text={title}
          size="22"
          lineHeight="28"
          letterSpacing="-2"
          bold
          centered
        />
        {message && (
          <Text
            text={message}
            size="14"
            lineHeight="20"
            letterSpacing="-2"
            color="#46535F"
          />
        )}
        <div className="flex gap-4 mt-2">
          <CancelButton onClick={onCancel} />
          <ConfirmButton onClick={onConfirm} />
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
