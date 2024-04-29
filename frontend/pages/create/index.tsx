import Layout from "@/components/Layout"
import PageHeader from "@/components/PageHeader"
import Card from "@/components/SplitterData/Card"
import Text from "@/components/Text"
import Link from "next/link"

const DATA = [
  {
    title: "Custom Contract",
    subtitle:
      "Create a custom contract from scratch using the contract editor.",
    link: "/create/custom",
  },
  {
    title: "Contract Network",
    subtitle:
      "Create a network to connect multiple contracts using drag & drop editor.",
    link: "/create/network",
  },
]

const CreateContract = () => {
  return (
    <Layout>
      <div className="mt-10 flex flex-col items-center">
        <PageHeader
          title="Contract Templates"
          subtitle="Choose a contract template to get started."
        />

        <div className="mt-10 flex gap-4 items-center">
          {DATA.map((item, index) => {
            return (
              <div key={index} className="w-[300px]">
                <Card>
                  <div className="w-full flex flex-col items-center gap-5">
                    <Text
                      text={item.title}
                      size="18"
                      lineHeight="20"
                      color="#000000"
                    />
                    <Text
                      text={item.subtitle}
                      size="14"
                      lineHeight="16"
                      color="#46535F"
                      centered
                    />
                    <Link href={item.link}>
                      <div className="border border-[#FFDC93] p-2 px-6 rounded-lg mt-3 group hover:bg-[#FFDC93]">
                        <Text
                          text="Choose"
                          size="14"
                          lineHeight="16"
                          color="#000000"
                          bold
                          customStyle="group-hover:!text-black"
                        />
                      </div>
                    </Link>
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}

export default CreateContract
