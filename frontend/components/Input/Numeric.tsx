import clsx from "clsx"
import React from "react"
import {
  NumberFormatValues,
  NumericFormat,
  SourceInfo,
} from "react-number-format"

interface ShareInputProps {
  placeholder: string
  onChange: (value: string) => void
  value?: string
  disabled?: boolean
  className?: string
}

const NumericInput: React.FC<ShareInputProps> = ({
  placeholder,
  onChange,
  value,
  disabled,
  className,
}) => {
  const numericChange = (values: NumberFormatValues, _: SourceInfo) => {
    onChange(values.value)
  }

  return (
    <NumericFormat
      className={clsx(
        "h-[28px] w-full rounded-[8px] text-[12px] flex justify-between items-center border-2 border-[#EBF2F7] p-4 px-2",
        className
      )}
      value={value}
      placeholder={placeholder}
      onValueChange={numericChange}
      disabled={disabled}
    />
  )
}

export default NumericInput
