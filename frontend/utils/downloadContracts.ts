import { SuccessContractDetails } from "@/components/Modal/CustomSuccessModal"

export const downloadContracts = (contracts: SuccessContractDetails[]) => {
  const link = document.createElement("a")
  link.href = `data:text/json;chatset=utf-8,${encodeURIComponent(
    JSON.stringify(contracts, null, 2)
  )}`
  link.download = "sorosplits-contracts.json"
  link.click()
}
