import clsx from "clsx"
import React from "react"
import Text from "../Text"
import Image from "next/image"

interface BaseButtonProps {
  text: string
  onClick: () => void
  bgColor: string
  icon?: {
    src: string
    size: number
  }
  long?: boolean
}

const BaseButton: React.FC<BaseButtonProps> = ({
  text,
  onClick,
  bgColor,
  icon,
  long = false,
}) => {
  return (
    <button
      className={clsx(
        "h-7 flex justify-center items-center text-black font-bold py-1 px-2 rounded gap-1",
        long ? "w-[100px]" : "w-[76px]"
      )}
      style={{ backgroundColor: bgColor }}
      onClick={onClick}
    >
      {icon && (
        <Image src={icon.src} alt="icon" height={icon.size} width={icon.size} />
      )}
      <Text text={text} size="12" lineHeight="16" letterSpacing="-1.5" bold />
    </button>
  )
}

const ManageSplitterButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <BaseButton
      text="Manage"
      onClick={onClick}
      bgColor="#FFDC93"
      icon={{
        src: "/icons/wrench.svg",
        size: 10,
      }}
    />
  )
}

const ManageSplitterDoneButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <BaseButton
      text="Done"
      onClick={onClick}
      bgColor="#FFDC93"
      icon={{
        src: "/icons/check.svg",
        size: 16,
      }}
    />
  )
}

const DistributeTokensButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <BaseButton
      text="Distribute"
      onClick={onClick}
      bgColor="#FFDC93"
      icon={{
        src: "/icons/check.svg",
        size: 16,
      }}
      long
    />
  )
}

const ManageSplitterCancelButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <BaseButton
      text="Cancel"
      onClick={onClick}
      bgColor="#FF9E9E"
      icon={{
        src: "/icons/close.svg",
        size: 14,
      }}
    />
  )
}

const CreateSplitterButton = () => {
  return (
    <BaseButton
      text="Create"
      onClick={() => {}}
      bgColor="#FFDC93"
      icon={{
        src: "/icons/create.svg",
        size: 10,
      }}
    />
  )
}

const CreateSplitterDoneButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <BaseButton
      text="Done"
      onClick={onClick}
      bgColor="#FFDC93"
      icon={{
        src: "/icons/check.svg",
        size: 16,
      }}
    />
  )
}

const CreateSplitterResetButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <BaseButton
      text="Reset"
      onClick={onClick}
      bgColor="#FF9E9E"
      icon={{
        src: "/icons/close.svg",
        size: 14,
      }}
    />
  )
}

const SearchSplitterButton = () => {
  return (
    <BaseButton
      text="Search"
      onClick={() => {}}
      bgColor="#FFDC93"
      icon={{
        src: "/icons/search.svg",
        size: 10,
      }}
    />
  )
}

export {
  ManageSplitterButton,
  ManageSplitterDoneButton,
  ManageSplitterCancelButton,
  CreateSplitterButton,
  SearchSplitterButton,
  CreateSplitterDoneButton,
  CreateSplitterResetButton,
  DistributeTokensButton,
}
