const truncateAddressShort = (address: string) => {
  if (address == "") return address
  return `${address.substring(0, 6)}....${address.substring(
    address.length - 4
  )}`
}

const truncateAddressLong = (address: string) => {
  if (address == "") return address
  return `${address.substring(0, 10)}.....${address.substring(
    address.length - 10
  )}`
}

const truncateAddressMega = (address: string) => {
  if (address == "") return address
  return `${address.substring(0, 20)}.....${address.substring(
    address.length - 20
  )}`
}

export { truncateAddressLong, truncateAddressShort, truncateAddressMega }
