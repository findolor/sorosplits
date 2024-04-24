import clsx from "clsx"
import React from "react"
import Text from "../Text"
import Image from "next/image"
import useAppStore from "@/store/index"

interface BaseButtonProps {
  text: string
  onClick: () => void
  bgColor: string
  icon?: {
    src: string
    size: number
  }
}

const BaseButton: React.FC<BaseButtonProps> = ({
  text,
  onClick,
  bgColor,
  icon,
}) => {
  const { loading } = useAppStore()
  return (
    <button
      className={clsx(
        "w-[100px] h-8 flex justify-center items-center text-black font-bold py-1 px-2 rounded gap-1",
        loading && "opacity-25"
      )}
      style={{ backgroundColor: bgColor }}
      onClick={onClick}
      disabled={loading}
    >
      {icon && (
        <Image src={icon.src} alt="icon" height={icon.size} width={icon.size} />
      )}
      <Text text={text} size="12" lineHeight="16" letterSpacing="-1.5" bold />
    </button>
  )
}

const ConfirmButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <BaseButton
      text="Confirm"
      onClick={onClick}
      bgColor="#FFDC93"
      icon={{
        src: "/icons/check.svg",
        size: 16,
      }}
    />
  )
}

const CancelButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <BaseButton
      text="Go back"
      onClick={onClick}
      bgColor="#FF9E9E"
      icon={{
        src: "/icons/close.svg",
        size: 14,
      }}
    />
  )
}

export { ConfirmButton, CancelButton }
