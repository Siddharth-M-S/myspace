'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface SearchContextType {
  openSearch: () => void
  closeSearch: () => void
  isOpen: boolean
}

const SearchContext = createContext<SearchContextType>({
  openSearch: () => {},
  closeSearch: () => {},
  isOpen: false,
})

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <SearchContext.Provider value={{ openSearch: () => setIsOpen(true), closeSearch: () => setIsOpen(false), isOpen }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearchModal() {
  return useContext(SearchContext)
}
