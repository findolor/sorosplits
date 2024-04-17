import clsx from "clsx"
import React from "react"

interface TextProps {
  text: string
  color?: string
  size?: string
  bold?: boolean
  lineHeight?: string
  letterSpacing?: string
  centered?: boolean
  rightAligned?: boolean
  customStyle?: string
}

const Text: React.FC<TextProps> = ({
  text,
  color = "#000000",
  size = "16",
  bold = false,
  lineHeight = "24",
  letterSpacing = "0",
  centered = false,
  rightAligned = false,
  customStyle = "",
}) => {
  const classes = `
    ${bold ? "font-bold" : "font-normal"}
    ${rightAligned ? "text-right" : "text-left"}
    ${centered && "text-center"}
  `

  return (
    <p
      className={clsx(classes, customStyle)}
      style={{
        color,
        fontSize: `${size}px`,
        lineHeight: `${lineHeight}px`,
        letterSpacing: `${letterSpacing}%`,
      }}
    >
      {text}
    </p>
  )
}

export default Text
