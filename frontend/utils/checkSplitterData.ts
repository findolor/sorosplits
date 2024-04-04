import { ShareDataProps } from "@sorosplits/sdk/lib/contracts/Splitter"

const checkSplitterData = (data: ShareDataProps[]) => {
  if (data.length < 2) throw new Error("Please enter at least two shareholders")

  data.map((item) => {
    if (item.shareholder === "")
      throw new Error("Please enter a shareholder address")
    if (item.share === 0) throw new Error("Please enter a share amount")
  })

  let uniqueShareholders = new Set(data.map((item) => item.shareholder))
  if (uniqueShareholders.size !== data.length)
    throw new Error("Shareholders must contain unique addresses")

  let totalShares = data.reduce((a, b) => a + b.share, 0)
  if (totalShares !== 100) throw new Error("Total shares must be equal to 100%")
}

export default checkSplitterData
