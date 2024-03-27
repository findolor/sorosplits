import React from "react"

interface SearchProps {
  placeholder?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  value?: string
}

const Search: React.FC<SearchProps> = ({ placeholder, onChange, value }) => {
  return (
    <input
      className="search-input w-[600px] h-[40px] border rounded-[8px] border-[#EBF2F7] shadow-[0_0_6px_#4E4E4E14] px-4 py-3 text-[14px]"
      type="text"
      placeholder={placeholder}
      onChange={onChange}
      value={value}
    />
  )
}

export default Search
