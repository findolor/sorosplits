interface PageHeaderProps {
  title: string
  subtitle: string
}

const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    <div>
      <h1 className="text-[64px] font-bold">{title}</h1>
      <p className="mb-2">{subtitle}</p>
    </div>
  )
}

export default PageHeader
