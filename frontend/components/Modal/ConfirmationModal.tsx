import React from "react"
import { ConfirmButton, CancelButton } from "../Button/Modal"
import Text from "../Text"
import BaseModal from "./Modal"

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
  return (
    <BaseModal size={305} isOpen={isOpen} bgColor="white">
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
    </BaseModal>
  )
}

export default ConfirmationModal
