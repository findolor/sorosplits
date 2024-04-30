export const getBalance = (amount: BigInt, decimals: number) => {
  return Number(amount) / Math.pow(10, decimals)
}

export const floorToFixed = (num: number, decimals: number) => {
  const factor = 10 ** decimals
  return (Math.floor(num * factor) / factor).toFixed(decimals)
}
