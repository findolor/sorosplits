import clsx from "clsx"
import { ChangeEvent, useMemo } from "react"
import {
  NumberFormatValues,
  NumericFormat,
  SourceInfo,
} from "react-number-format"

interface InputProps {
  onChange: (value: string) => void
  placeholder: string
  small?: boolean
  value: string
  maxLength?: number
  numeric?: boolean
  disabled?: boolean
}

const Input = ({
  onChange,
  value,
  placeholder,
  small,
  maxLength,
  numeric,
  disabled,
}: InputProps) => {
  const style = useMemo(() => {
    return clsx(
      "p-2 px-4 text-sm bg-transparent placeholder:text-text placeholder:text-sm outline-none",
      small ? "w-[110px]" : "w-[600px]"
    )
  }, [small])

  const change = (e: ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value
    if (!numeric && /[^a-zA-Z0-9]/.test(inputValue)) {
      return
    }
    onChange(e.target.value)
  }

  const numericChange = (values: NumberFormatValues, _: SourceInfo) => {
    onChange(values.value)
  }

  return (
    <div className="bg-background-dark flex items-center rounded-lg h-10">
      {numeric ? (
        <NumericFormat
          className={style}
          value={value}
          decimalScale={2}
          suffix="%"
          placeholder="0.00"
          onValueChange={numericChange}
          disabled={disabled}
        />
      ) : (
        <input
          className={style}
          type="text"
          onChange={change}
          placeholder={placeholder}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
        />
      )}
    </div>
  )
}

export default Input
