import clsx from "clsx"
import { useState } from "react"

interface SwitchProps {
  initialState: boolean
  onChange: (value: boolean) => void
  locked?: boolean
}

const Switch = ({ initialState, onChange, locked }: SwitchProps) => {
  const [checked, setChecked] = useState(initialState)

  const toggle = () => {
    setChecked(!checked)
    onChange(!checked)
  }

  return (
    <div className="flex items-center">
      <button
        className={clsx(
          "relative inline-flex items-center h-[18px] w-[40px] pl-[2px] rounded-full transition-colors",
          checked ? "bg-[#FFDC93]" : "bg-transparent border border-[##C3D1DD]"
        )}
        onClick={!locked ? toggle : undefined}
        disabled={locked}
      >
        <span
          className={clsx(
            "inline-block h-[14px] w-[14px] rounded-full transition-transform",
            checked
              ? "translate-x-[21px] bg-black"
              : "translate-x-0 bg-[#C3D1DD]"
          )}
        />
      </button>
    </div>
  )
}

export default Switch
