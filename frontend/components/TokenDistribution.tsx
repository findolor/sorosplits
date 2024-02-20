import { useCallback, useEffect, useState } from "react"
import Input from "./Input"
import useTokenContract from "../hooks/contracts/useToken"
import { errorToast, loadingToast, successToast } from "../utils/toast"
import useAppStore from "../store"
import Button from "./Button"
import { DataProps } from "./SplitterData"
import truncateAddress from "../utils/truncateAddress"
import useSplitterContract from "../hooks/contracts/useSplitter"
import { TokenResult } from "../contracts/Token"

interface TokenDistributionProps {
  splitterContractAddress: string
  contractShares: DataProps[]
}

const TokenDistribution = ({
  splitterContractAddress,
  contractShares,
}: TokenDistributionProps) => {
  const splitterContract = useSplitterContract()
  const tokenContract = useTokenContract()
  const { loading, setLoading } = useAppStore()

  const [tokenAddress, setTokenAddress] = useState("")
  const [tokenInfo, setTokenInfo] = useState<TokenResult>()

  const fetchTokenBalance = useCallback(async () => {
    try {
      if (tokenAddress === "") {
        setTokenInfo(undefined)
        return
      }

      loadingToast("Fetching token information...")

      let results = await Promise.all([
        tokenContract.query({
          contractId: tokenAddress,
          method: "get_token_name",
          args: {},
        }),
        tokenContract.query({
          contractId: tokenAddress,
          method: "get_token_symbol",
          args: {},
        }),
        tokenContract.query({
          contractId: tokenAddress,
          method: "get_token_decimal",
          args: {},
        }),
        tokenContract.query({
          contractId: tokenAddress,
          method: "get_token_balance",
          args: { id: splitterContractAddress },
        }),
        ...contractShares.map((data) =>
          tokenContract.query({
            contractId: tokenAddress,
            method: "get_token_balance",
            args: { id: data.shareholder },
          })
        ),
      ]).catch((error) => {
        throw new Error(error)
      })

      if (results) {
        successToast(`Token information fetched!`)

        let name = results[0] as string
        let symbol = results[1] as string
        let decimals = results[2] as number
        let balance = results[3] as BigInt
        let userBalances = results.slice(4) as BigInt[]

        setTokenInfo({
          name,
          symbol,
          decimals,
          balance,
          userBalances,
        })
      }
    } catch (error: any) {
      setTokenInfo(undefined)
      errorToast(error)
    }
  }, [tokenAddress])

  useEffect(() => {
    const timeout = setTimeout(async () => {
      await fetchTokenBalance()
    })
    return () => clearTimeout(timeout)
  }, [tokenAddress, fetchTokenBalance])

  const distributeTokens = async () => {
    try {
      setLoading(true)

      if (!tokenInfo) return

      loadingToast("Distributing tokens to shareholders...")

      await splitterContract.call({
        contractId: splitterContractAddress,
        method: "distribute_tokens",
        args: {
          token_address: tokenAddress,
        },
      })

      await fetchTokenBalance()

      setLoading(false)
      successToast("Tokens distributed successfully!")
    } catch (error) {
      setLoading(false)
      errorToast(error)
    }
  }

  const displayTokenBalance = (value: BigInt) => {
    if (!tokenInfo) return 0
    const balance = Number(value) / Math.pow(10, tokenInfo.decimals)
    if (balance === 0) return 0
    else return balance.toFixed(tokenInfo.decimals)
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">Token Distribution</h3>
      <p className="mb-2">
        Search for a token address to distribute tokens to shareholders.
      </p>

      <div className="flex">
        <Input
          placeholder="Enter token address"
          onChange={setTokenAddress}
          value={tokenAddress}
        />
      </div>

      {tokenInfo && (
        <div className="flex gap-10 mt-4">
          <div>
            <h3 className="text-lg font-bold">Token Name</h3>
            <p>{tokenInfo.name}</p>
          </div>

          <div>
            <h3 className="text-lg font-bold">Splitter Balance</h3>
            <p>
              {displayTokenBalance(tokenInfo.balance)} {tokenInfo.symbol}
            </p>
          </div>
        </div>
      )}

      {tokenInfo && (
        <div className="mt-4">
          <div className="flex gap-10">
            <h3 className="text-lg font-bold">Shareholder</h3>
            <h3 className="text-lg font-bold">Token Balance</h3>
          </div>
          {contractShares.map((data, idx) => (
            <div key={data.shareholder} className="flex gap-10">
              <p className="w-[105px]">{truncateAddress(data.shareholder)}</p>
              <p>
                {displayTokenBalance(tokenInfo.userBalances[idx])}{" "}
                {tokenInfo.symbol}
              </p>
            </div>
          ))}
        </div>
      )}

      {tokenInfo && (
        <>
          <div className="h-8" />
          <Button
            text="Distribute Tokens"
            onClick={distributeTokens}
            type="primary"
            loading={loading || Number(tokenInfo.balance) === 0}
          />
        </>
      )}
    </div>
  )
}

export default TokenDistribution
