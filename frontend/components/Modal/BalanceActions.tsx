import React, { useState } from "react"
import { ConfirmButton, CancelButton } from "../Button/Modal"
import Text from "../Text"
import BaseModal from "./Modal"
import clsx from "clsx"
import AddressInput from "../Input/Address"
import NumericInput from "../Input/Numeric"
import useAppStore from "@/store/index"

export type Action =
  | "withdraw_allocation"
  | "swap_and_distribute_tokens"
  | "distribute_tokens"
  | "transfer_tokens"

interface ModalProps {
  isOpen: boolean
  title: string
  message?: string
  isAdmin: boolean
  maxAmounts: {
    allocation: number
    unused: number
  }
  isDiversifierActive: boolean
  onConfirm: (action: Action, data: Record<string, any>) => void
  onCancel: () => void
}

const BalanceActionsModal: React.FC<ModalProps> = ({
  isOpen,
  title,
  message,
  isAdmin,
  maxAmounts,
  isDiversifierActive,
  onConfirm,
  onCancel,
}) => {
  const { loading } = useAppStore()

  const [action, setAction] = useState<null | Action>(null)
  const [data, setData] = useState<Record<string, any>>({
    amount: "",
    recipient: "",
  })

  return (
    <BaseModal
      size={400}
      isOpen={isOpen}
      bgColor="white"
      onOutsideClick={() => {
        if (!loading) onCancel()
      }}
    >
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

      {!action && (
        <div className="flex flex-col gap-4 mt-1">
          <ActionButton
            text="Withdraw Allocation"
            onClick={() => setAction("withdraw_allocation")}
            disabled={loading || false}
          />
          <ActionButton
            text={
              isDiversifierActive
                ? "Swap and Distribute Tokens"
                : "Distribute Tokens"
            }
            onClick={() =>
              setAction(
                isDiversifierActive
                  ? "swap_and_distribute_tokens"
                  : "distribute_tokens"
              )
            }
            disabled={loading || !isAdmin}
          />
          <ActionButton
            text="TransferTokens"
            onClick={() => setAction("transfer_tokens")}
            disabled={loading || !isAdmin}
          />
        </div>
      )}

      {action !== null && (
        <Text
          text={action
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
          size="14"
          lineHeight="20"
          letterSpacing="-2"
          color="#46535F"
          centered
          bold
        />
      )}

      <div className="flex flex-col w-full gap-1">
        {action === "transfer_tokens" && (
          <AddressInput
            placeholder="Enter recipient address"
            onChange={(e) => setData({ ...data, recipient: e.target.value })}
            value={data.recipient}
          />
        )}

        {action !== null && (
          <div className="flex items-center gap-2 w-full">
            <NumericInput
              placeholder="Enter withdraw amount"
              onChange={(value) => setData({ ...data, amount: value })}
              value={data.amount}
            />
            <button
              onClick={() =>
                setData({
                  ...data,
                  amount:
                    action === "withdraw_allocation"
                      ? maxAmounts.allocation
                      : maxAmounts.unused,
                })
              }
            >
              <Text
                text="Max"
                size="12"
                lineHeight="20"
                letterSpacing="-2"
                color="#3A3A3A"
                centered
              />
            </button>
          </div>
        )}
      </div>

      {action !== null && (
        <div className="flex items-center gap-2 mt-2">
          <CancelButton
            onClick={() => {
              setData({ amount: "", recipient: "" })
              setAction(null)
            }}
          />
          <ConfirmButton onClick={() => onConfirm(action, data)} />
        </div>
      )}
    </BaseModal>
  )
}

const ActionButton: React.FC<{
  text: string
  onClick: () => void
  disabled: boolean
}> = ({ text, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "text-[#3A3A3A] border border-black p-2 px-4 rounded-lg group",

        disabled ? "opacity-50" : "hover:bg-black cursor-pointer"
      )}
      disabled={disabled}
    >
      <Text
        text={text}
        size="14"
        lineHeight="20"
        letterSpacing="-2"
        color="#3A3A3A"
        centered
        bold
        customStyle={clsx(!disabled && "group-hover:!text-white")}
      />
    </button>
  )
}

export default BalanceActionsModal
