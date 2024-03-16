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
  error?: boolean
  errorMessage?: string
}

const Input = ({
  onChange,
  value,
  placeholder,
  small,
  maxLength,
  numeric,
  disabled,
  error,
  errorMessage,
}: InputProps) => {
  const style = useMemo(() => {
    return clsx(
      "bg-background-dark p-2 px-4 text-sm placeholder:text-text placeholder:text-sm outline-none rounded-lg",
      small ? "w-[110px]" : "w-[600px]",
      error ? "border-2 border-red-500" : ""
    )
  }, [small, error])

  const change = (e: ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value
    if (!numeric && /[^a-zA-Z0-9.]/.test(inputValue)) {
      return
    }
    onChange(e.target.value)
  }

  const numericChange = (values: NumberFormatValues, _: SourceInfo) => {
    onChange(values.value)
  }

  return (
    <div className="flex items-center h-auto rounded-lg">
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
        <div className="flex flex-col">
          <input
            className={style}
            type="text"
            onChange={change}
            placeholder={placeholder}
            value={value}
            maxLength={maxLength}
            disabled={disabled}
          />
          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default Input
