export const getBalance = (amount: BigInt, decimals: number) => {
  return Number(amount) / Math.pow(10, decimals)
}
