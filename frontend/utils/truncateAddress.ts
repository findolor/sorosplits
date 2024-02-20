const truncateAddress = (address: string) => {
    if (!address) return ""
    const firstChars = address.slice(0, 4)
    const lastChars = address.slice(-4)

    return `${firstChars}.....${lastChars}`
}

export default truncateAddress
