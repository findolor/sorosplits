import React from "react"

const Loading: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-12">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#dee6ec] border-solid border-t-transparent"></div>
    </div>
  )
}

export default Loading
