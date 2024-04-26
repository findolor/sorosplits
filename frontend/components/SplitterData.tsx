import { useCallback, useMemo, useRef, useState } from "react"
import Input from "./Input"
import { CgClose } from "react-icons/cg"
import { AiOutlineUserAdd } from "react-icons/ai"
import clsx from "clsx"
import { Contract, Keypair, StrKey } from "stellar-sdk"
import useContracts from "@/hooks/contracts/useContracts"
import { ShareDataProps } from "sorosplits-sdk/lib/contracts/Splitter"

interface InputData {
  input: string
  shareData: ShareDataProps
}

interface IErrorData {
  value: boolean
  message?: string
}

interface ISplitterData {
  initialData?: InputData[]
  updateData: (data: InputData[]) => void
  locked?: boolean
}

const INITIAL_DATA: InputData[] = [
  {
    input: "",
    shareData: {
      share: 0,
      shareholder: "",
    },
  },
  {
    input: "",
    shareData: {
      share: 0,
      shareholder: "",
    },
  },
]

const SplitterData = ({ initialData, updateData, locked }: ISplitterData) => {
  const { nameServiceContract } = useContracts()

  const [data, setData] = useState<InputData[]>(initialData ?? INITIAL_DATA)
  const [dataError, setDataError] = useState<IErrorData[]>([
    { value: false },
    { value: false },
  ])

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const debounce = <F extends (...args: any[]) => any>(
    func: F,
    wait: number
  ): ((...args: Parameters<F>) => void) => {
    return function executedFunction(...args: Parameters<F>) {
      const later = () => {
        timeoutRef.current = null
        func(...args)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(later, wait)
    }
  }

  const validateAndSetData = useCallback(async (idx: number, value: string) => {
    const setError = (hasError: boolean, userAddress: string = "") => {
      toggleDataError(
        idx,
        hasError,
        hasError ? "Invalid user, contract or domain address" : ""
      )
      updateDataShareholder(idx, hasError ? "" : userAddress)
    }

    try {
      Keypair.fromPublicKey(value)
      setError(false)
    } catch {
      try {
        StrKey.decodeContract(value)
        setError(false)
      } catch {
        const isValidDomain = await nameServiceContract.isValidDomainStr(value)
        if (!isValidDomain) {
          setError(true)
          return
        }

        try {
          const userAddress = await nameServiceContract.parseDomainStr(value)
          if (userAddress === null) {
            setError(true)
          } else {
            setError(false, userAddress)
          }
        } catch {
          setError(true)
        }
      }
    }
  }, [])

  const debouncedValidateAndSetData = useMemo(
    () => debounce(validateAndSetData, 500),
    [validateAndSetData]
  )

  const toggleDataError = (idx: number, value: boolean, message?: string) => {
    setDataError((prevDataError) => {
      const newDataError = [...prevDataError]
      newDataError[idx].value = value
      newDataError[idx].message = message
      return newDataError
    })
  }

  const updateDataInput = async (idx: number, value: string) => {
    const newData = [...data]
    newData[idx].input = value
    setData(newData)
    updateData(newData)
    debouncedValidateAndSetData(idx, value)
  }

  const updateDataShareholder = async (idx: number, value: string) => {
    const newData = [...data]
    newData[idx].shareData.shareholder = value
    setData(newData)
    updateData(newData)
  }

  const updateDataShare = (idx: number, value: string) => {
    const newData = [...data]
    newData[idx].shareData.share = parseFloat(value)
    setData(newData)
    updateData(newData)
  }

  const removeData = (idx: number) => {
    const newData = [...data]
    newData.splice(idx, 1)
    setData(newData)
    updateData(newData)
  }

  const addData = () => {
    const newData = [...data]
    newData.push({
      input: "",
      shareData: {
        share: 0,
        shareholder: "",
      },
    })
    setData(newData)

    const newErrorData = [...dataError]
    newErrorData.push({ value: false })
    setDataError(newErrorData)

    updateData(newData)
  }

  const totalShareAmount = useMemo(() => {
    return data.reduce(
      (total, item) =>
        total + (isNaN(item.shareData.share) ? 0 : item.shareData.share),
      0
    )
  }, [data])

  return (
    <div className="w-fit">
      <div className="flex flex-col gap-3">
        {data.map((item, idx) => {
          return (
            <div key={idx} className="flex gap-4">
              <Input
                placeholder="User address"
                onChange={(value) => updateDataInput(idx, value)}
                value={item.input}
                disabled={locked}
                error={dataError[idx].value}
                errorMessage={dataError[idx].message}
              />
              <Input
                placeholder="Percentage"
                onChange={(value) => updateDataShare(idx, value)}
                small
                value={item.shareData.share.toString()}
                maxLength={4}
                numeric
                disabled={locked}
              />
              {!locked && data.length > 2 && (
                <button
                  className="rounded-lg border-2 border-background-dark h-10 w-10 flex items-center justify-center hover:bg-accent group"
                  onClick={() => removeData(idx)}
                >
                  <CgClose
                    size={14}
                    className="text-text group-hover:text-white"
                  />
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex justify-between items-end">
        <button
          className={clsx(
            "flex items-center justify-between px-4 py-1 text-sm w-[110px] bg-secondary hover:bg-secondary-dark mt-4 rounded-md",
            locked && "opacity-50"
          )}
          onClick={addData}
          disabled={locked}
        >
          <AiOutlineUserAdd size={16} />
          Add User
        </button>
        <div
          className={clsx(
            "py-1 mr-3 font-bold",
            totalShareAmount > 100 && "text-red-500",
            totalShareAmount === 100 && "text-green-500",
            totalShareAmount < 100 && "text-yellow-500"
          )}
        >
          Total: {totalShareAmount}%
        </div>
      </div>
    </div>
  )
}

export default SplitterData
export { INITIAL_DATA }
export type { InputData }
