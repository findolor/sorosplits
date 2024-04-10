const fs = require("fs")

const splitterWasmHash = fs.readFileSync(
  "./scripts/artifacts/splitter_contract_wasm_hash",
  "utf8"
)
const diversifierWasmHash = fs.readFileSync(
  "./scripts/artifacts/diversifier_contract_wasm_hash",
  "utf8"
)

const splitterByteArray = Buffer.from(splitterWasmHash, "hex")
const formattedByteArray = `[${Array.from(splitterByteArray)
  .map((byte) => byte)
  .join(", ")}]`
console.log(`Splitter: ${formattedByteArray}\n`)

const diversifierByteArray = Buffer.from(diversifierWasmHash, "hex")
const formattedDiversifierByteArray = `[${Array.from(diversifierByteArray)
  .map((byte) => byte)
  .join(", ")}]`
console.log(`Diversifier: ${formattedDiversifierByteArray}\n`)
