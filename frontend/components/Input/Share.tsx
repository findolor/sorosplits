import React from "react"
import {
  NumberFormatValues,
  NumericFormat,
  SourceInfo,
} from "react-number-format"

interface ShareInputProps {
  onChange: (value: string) => void
  value?: string
  disabled?: boolean
}

const ShareInput: React.FC<ShareInputProps> = ({
  onChange,
  value,
  disabled,
}) => {
  const numericChange = (values: NumberFormatValues, _: SourceInfo) => {
    onChange(values.value)
  }

  return (
    <NumericFormat
      className="h-[28px] w-[70px] rounded-[8px] text-[12px] flex justify-between items-center border-2 border-[#EBF2F7] p-4 px-2 text-end"
      value={value}
      decimalScale={2}
      suffix="%"
      placeholder="0.00"
      onValueChange={numericChange}
      disabled={disabled}
    />
  )
}

export default ShareInput
