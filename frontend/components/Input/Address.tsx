import React from "react"

interface AddressInputProps {
  placeholder?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  value?: string
}

const AddressInput: React.FC<AddressInputProps> = ({
  placeholder,
  onChange,
  value,
}) => {
  return (
    <input
      className="h-[28px] w-full rounded-[8px] text-[12px] flex justify-between items-center border-2 border-[#EBF2F7] p-4 px-2"
      type="text"
      placeholder={placeholder}
      onChange={onChange}
      value={value}
    />
  )
}

export default AddressInput
