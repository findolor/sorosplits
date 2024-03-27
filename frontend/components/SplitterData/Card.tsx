interface CardProps {
  children: React.ReactNode
  width: string
}

const Card: React.FC<CardProps> = ({ children, width = "" }) => {
  return (
    <div
      className="flex flex-col h-fit p-4 bg-white border border-[#EBF2F7] rounded-2xl"
      style={{ width: `${width}px` }}
    >
      {children}
    </div>
  )
}

export default Card
