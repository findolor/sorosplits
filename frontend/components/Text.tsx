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
}

const Text: React.FC<TextProps> = ({
  text,
  color = "#000000",
  size = "16",
  bold = false,
  lineHeight = "24",
  letterSpacing = "0",
  centered = false,
}) => {
  const classes = `
    text-[${size}px]
    ${bold ? "font-bold" : "font-normal"}
    leading-[${lineHeight}px]
    tracking-[${letterSpacing}%]
    ${centered ? "text-center" : "text-left"}
  `

  return (
    <p className={classes} style={{ color }}>
      {text}
    </p>
  )
}

export default Text
