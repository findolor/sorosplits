import { useMemo } from "react"
import { clsx } from "clsx"

type ButtonType = "wallet" | "primary" | "secondary" | "outline"

interface ButtonProps {
  text: string
  onClick: () => void
  type: ButtonType
  loading?: boolean
}

const Button = ({ text, onClick, type, loading }: ButtonProps) => {
  const buttonColor = useMemo(() => {
    switch (type) {
      case "wallet":
        return "bg-accent text-white hover:bg-accent-dark"
      case "primary":
        return "bg-primary text-text hover:bg-primary-dark"
      case "secondary":
        return "bg-secondary"
      case "outline":
        return "bg-transparent border-2 border-background-dark hover:bg-background-dark"
    }
  }, [type])

  return (
    <button
      className={clsx(
        "button w-40 h-9 flex items-center justify-center py-2 px-4 rounded-lg",
        buttonColor,
        loading && "opacity-50"
      )}
      onClick={onClick}
      disabled={loading}
    >
      <span className="text-sm">{text}</span>
    </button>
  )
}

export default Button
