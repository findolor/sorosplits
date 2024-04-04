import clsx from "clsx"
import React from "react"

interface AddressInputProps {
  placeholder?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  value?: string
  alignRight?: boolean
  disabled?: boolean
}

const AddressInput: React.FC<AddressInputProps> = ({
  placeholder,
  onChange,
  value,
  alignRight = false,
  disabled,
}) => {
  return (
    <input
      className={clsx(
        "h-[28px] w-full rounded-[8px] text-[12px] flex justify-between items-center border-2 border-[#EBF2F7] p-4 px-2",
        alignRight && "text-end"
      )}
      type="text"
      placeholder={placeholder}
      onChange={onChange}
      value={value}
      disabled={disabled}
    />
  )
}

export default AddressInput
