'use client'

import { createContext, useContext, ReactNode } from 'react'

interface LinkUpdateContextType {
  updateLinkInPreview?: (linkData: any) => void
}

const LinkUpdateContext = createContext<LinkUpdateContextType>({})

export const useLinkUpdate = () => useContext(LinkUpdateContext)

interface LinkUpdateProviderProps {
  children: ReactNode
  updateLinkInPreview?: (linkData: any) => void
}

export function LinkUpdateProvider({ children, updateLinkInPreview }: LinkUpdateProviderProps) {
  return (
    <LinkUpdateContext.Provider value={{ updateLinkInPreview }}>
      {children}
    </LinkUpdateContext.Provider>
  )
}