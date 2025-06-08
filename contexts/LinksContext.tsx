'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Link as LinkType } from '@/types'

interface Folder {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  isExpanded: boolean
  links: LinkType[]
  order: number
  parentId?: string | null
  children?: Folder[]
}

interface LinksContextType {
  links: LinkType[]
  folders: Folder[]
  loading: boolean
  refreshLinks: () => Promise<void>
  refreshFolders: () => Promise<void>
  refreshAll: () => Promise<void>
  forceRefresh: () => void
}

const LinksContext = createContext<LinksContextType | undefined>(undefined)

export function LinksProvider({ children }: { children: ReactNode }) {
  const [links, setLinks] = useState<LinkType[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/links')
      if (response.ok) {
        const data = await response.json()
        console.log('🔄 LinksContext - Links rechargés:', data.length)
        setLinks(data)
      }
    } catch (error) {
      console.error('❌ LinksContext - Erreur chargement links:', error)
    }
  }

  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/folders')
      if (response.ok) {
        const data = await response.json()
        console.log('🔄 LinksContext - Folders rechargés:', data.length)
        setFolders(data)
      }
    } catch (error) {
      console.error('❌ LinksContext - Erreur chargement folders:', error)
    }
  }

  const refreshLinks = async () => {
    console.log('🔄 LinksContext - refreshLinks appelé')
    await fetchLinks()
  }

  const refreshFolders = async () => {
    console.log('🔄 LinksContext - refreshFolders appelé')
    await fetchFolders()
  }

  const refreshAll = async () => {
    console.log('🔄 LinksContext - refreshAll appelé')
    await Promise.all([fetchLinks(), fetchFolders()])
    setLoading(false)
  }

  const forceRefresh = () => {
    console.log('🔄 LinksContext - forceRefresh appelé')
    setRefreshKey(prev => prev + 1)
    refreshAll()
  }

  useEffect(() => {
    refreshAll()
  }, [])

  // Effect pour surveiller les changements
  useEffect(() => {
    console.log('👀 LinksContext - Links/Folders changés:', {
      links: links.length,
      folders: folders.length,
      refreshKey
    })
  }, [links, folders, refreshKey])

  return (
    <LinksContext.Provider value={{
      links,
      folders,
      loading,
      refreshLinks,
      refreshFolders,
      refreshAll,
      forceRefresh
    }}>
      {children}
    </LinksContext.Provider>
  )
}

export function useLinks() {
  const context = useContext(LinksContext)
  if (context === undefined) {
    throw new Error('useLinks must be used within a LinksProvider')
  }
  return context
}