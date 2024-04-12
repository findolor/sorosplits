import React from "react"
import useAppStore from "../../store"
import Loading from "../Loading"

interface BaseModalProps {
  children: React.ReactNode
  isOpen: boolean
  size: number
  bgColor: string
}

const BaseModal: React.FC<BaseModalProps> = ({
  children,
  isOpen,
  size,
  bgColor,
}) => {
  const { loading } = useAppStore()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-20">
      <div
        className="flex flex-col justify-center items-center p-6 rounded-lg shadow-lg gap-4"
        style={{ width: size, backgroundColor: bgColor }}
      >
        {loading && <Loading />}
        {!loading && <>{children}</>}
      </div>
    </div>
  )
}

export default BaseModal
