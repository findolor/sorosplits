const parseContractError = (error: any) => {
  if (typeof error !== "string") {
    return error
  }
  let match = error.match(/Error\(Contract, #(\d+)\)/)
  if (match && match[1]) {
    const errorCode = Number(match[1])
    return ERRORS[errorCode]
  } else return error
}

const ERRORS: Record<number, string> = {
  1: "",
  5: "Total amount of shares must be at least 2",
}

export default parseContractError
