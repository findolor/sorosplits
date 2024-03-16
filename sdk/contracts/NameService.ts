import { Contract, xdr } from "@stellar/stellar-sdk"
import BaseContract from "./Base"
import CONFIG, { Network } from "../config"

interface ParseDomainResponse {
  owner: string
  address: string
  node: Buffer
  collateral: BigInt
  exp_date: BigInt
}

interface CoreDataResponse {
  adm: string
  allowed_tlds: Buffer[]
  col_asset: string
  min_duration: BigInt
  node_rate: BigInt
}

export class NameServiceContract extends BaseContract {
  public contract: Contract

  constructor(network: Network) {
    super(network, "")
    this.contract = new Contract(CONFIG[network].sorobanDomainsContractId)
  }

  async parseDomainStr(domainStr: string): Promise<string | null> {
    const domain = domainStr.split(".")[0]
    const tld = domainStr.split(".")[1]

    const parseDomainOp = this.contract.call(
      "parse_domain",
      ...[
        xdr.ScVal.scvBytes(Buffer.from(domain, "utf-8")),
        xdr.ScVal.scvBytes(Buffer.from(tld, "utf-8")),
      ]
    )
    const parseDomainRes = await this.processQuery(parseDomainOp)

    const recordOp = this.contract.call(
      "record",
      ...[xdr.ScVal.scvBytes(Buffer.from(parseDomainRes))]
    )
    const recordRes = (await this.processQuery(
      recordOp
    )) as ParseDomainResponse | null

    if (!recordRes) {
      return null
    }
    return recordRes.address
  }

  async isValidDomainStr(domainStr: string) {
    const allowedTlds = await this.getAllowedTlds()
    const isValid = []

    for (const tld of allowedTlds) {
      const escapedTld = tld.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
      const pattern = `^[A-Za-z]+\\.${escapedTld}$`
      const re = new RegExp(pattern)
      isValid.push(re.test(domainStr))
    }

    return isValid.some((x) => x)
  }

  async getAllowedTlds() {
    const coreDataOp = this.contract.call("core_data")
    const coreDataRes = (await this.processQuery(
      coreDataOp
    )) as CoreDataResponse

    return coreDataRes.allowed_tlds.map((tld) => tld.toString("utf-8"))
  }
}

export default NameServiceContract
