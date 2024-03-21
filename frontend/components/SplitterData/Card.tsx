interface CardProps {
  children: React.ReactNode
  width: string
}

const Card: React.FC<CardProps> = ({ children, width = "" }) => {
  return (
    <div
      className={`w-[${width}px] flex flex-col h-fit p-4 bg-white border border-[#EBF2F7] rounded-2xl`}
    >
      {children}
    </div>
  )
}

export default Card
