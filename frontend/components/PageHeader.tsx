interface PageHeaderProps {
  title: string
  subtitle: string
}

const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    <div className="flex flex-col items-center tracking-[-2%]">
      <h1 className="text-[28px] font-bold leading-[32px] mb-6">{title}</h1>
      <p className="text-[15px] text-[#46535F] leading-[20px]">{subtitle}</p>
    </div>
  )
}

export default PageHeader
