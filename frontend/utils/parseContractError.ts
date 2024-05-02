const parseContractError = (error: any) => {
  if (typeof error !== "string") {
    return error
  }
  let match = error.match(/Error\(Contract, #(\d+)\)/)
  if (match && match[1]) {
    const errorCode = Number(match[1])
    const prefix =
      errorCode < 200
        ? "Splitter Contract Error:"
        : "Diversifier Contract Error:"
    return `${prefix} ${ERRORS[errorCode]}`
  } else return error
}

const ERRORS: Record<number, string> = {
  101: "Contract not initialized",
  102: "Contract is already initialized",
  103: "Unauthorized access",
  104: "Shareholders & shares are locked for this contract",
  105: "Total amount of shares must be at least 2",
  106: "Cannot add contract address as a shareholder",
  107: "Total shares must be equal to 100",
  108: "Insufficient token balance",
  109: "Transfer amount must be greater than 0",
  110: "Transfer amount exceeds balance",
  111: "Transfer amount exceeds unused balance",
  112: "Withdrawal amount must be greater than 0",
  113: "Withdrawal amount exceeds allocation",
  114: "Token is not whitelisted",
  201: "Contract is not initialized",
  202: "Diversifier is not active",
  203: "Method not allowed",
  204: "Invalid swap path",
  205: "Invalid swap token",
  206: "Insufficient token balance",
}

export default parseContractError
