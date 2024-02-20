import clsx from "clsx"
import { useState } from "react"

interface SwitchProps {
  initialState: boolean
  onChange: (value: boolean) => void
  text: string
  locked?: boolean
}

const Switch = ({ initialState, onChange, text, locked }: SwitchProps) => {
  const [checked, setChecked] = useState(initialState)

  const toggle = () => {
    setChecked(!checked)
    onChange(!checked)
  }

  return (
    <div className="flex items-center">
      <span className="tex">{text}</span>
      <label className={
        clsx(
          "relative inline-flex items-center mr-5 cursor-pointer ml-4",
          locked && "opacity-50 cursor-default"
        )
      }>
        <input
          type="checkbox"
          value=""
          className="sr-only peer"
          checked={checked}
          onChange={toggle}
          disabled={locked}
        />
        <div className="w-11 h-6 bg-background-dark rounded-full peer peer-focus:ring-4 peer-focus:ring-accent/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
      </label>
    </div>
  )
}

export default Switch
