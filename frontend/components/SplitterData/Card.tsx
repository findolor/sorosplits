interface CardProps {
  children: React.ReactNode
}

const Card: React.FC<CardProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-fit w-full p-4 bg-white border border-[#EBF2F7] rounded-2xl">
      {children}
    </div>
  )
}

export default Card
