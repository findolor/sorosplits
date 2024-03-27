import clsx from "clsx"
import React from "react"

interface LoadingProps {
  small?: boolean
}

const Loading: React.FC<LoadingProps> = ({ small = false }) => {
  return (
    <div className={`flex justify-center items-center h-12`}>
      <div
        className={clsx(
          "animate-spin rounded-full border-2 border-[#dee6ec] border-solid border-t-transparent",
          small ? "h-5 w-5" : "h-5 w-5"
        )}
      ></div>
    </div>
  )
}

export default Loading
