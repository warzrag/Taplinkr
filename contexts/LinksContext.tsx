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
  personalLinks: LinkType[]
  teamLinks: LinkType[]
  folders: Folder[]
  loading: boolean
  hasTeam: boolean
  refreshLinks: () => Promise<void>
  refreshFolders: () => Promise<void>
  refreshAll: () => Promise<void>
  forceRefresh: () => void
  incrementLinkClicks: (linkId: string) => void
  updateLinkOptimistic: (linkId: string, updates: Partial<LinkType>) => void
}

const LinksContext = createContext<LinksContextType | undefined>(undefined)

export function LinksProvider({ children }: { children: ReactNode }) {
  const [links, setLinks] = useState<LinkType[]>([])
  const [personalLinks, setPersonalLinks] = useState<LinkType[]>([])
  const [teamLinks, setTeamLinks] = useState<LinkType[]>([])
  const [hasTeam, setHasTeam] = useState(false)
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  // Fonction simplifiée sans retry automatique
  const fetchLinks = async (skipCache: boolean = false) => {
    // Éviter les appels multiples
    if (loading && !skipCache) {
      console.log('⏸️ Chargement déjà en cours')
      return
    }

    // ⚡ INSTANT: Charger depuis cache d'abord (sauf si skipCache)
    if (!skipCache) {
      const cached = localStorage.getItem('links-cache')
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached)
          // A recent snapshot prevents repeated Firestore reads on every navigation.
          if (Date.now() - timestamp < 15 * 60 * 1000 && (data.links?.length || 0) > 0) {
            setLinks(data.links || [])
            setPersonalLinks(data.personalLinks || [])
            setTeamLinks(data.teamLinks || [])
            setHasTeam(data.hasTeam || false)
            setLoading(false)
            setHasLoaded(true)
            console.log('⚡ Liens chargés depuis cache:', data.links?.length || 0)
            return
          }
        } catch (e) {
          console.error('Cache invalide:', e)
        }
      }

      // The folders workspace keeps a second snapshot. It can restore visible
      // links if a temporary database outage occurred after the main cache was cleared.
      const folderSnapshot = localStorage.getItem('folders-page-cache')
      if (folderSnapshot) {
        try {
          const parsed = JSON.parse(folderSnapshot)
          const collectFolderLinks = (items: any[]): LinkType[] => items.flatMap(folder => [
            ...(folder.links || []),
            ...collectFolderLinks(folder.children || []),
          ])
          const recoveredLinks = [
            ...(parsed.folders || []).flatMap((folder: any) => [
              ...(folder.links || []),
              ...collectFolderLinks(folder.children || []),
            ]),
            ...(parsed.unorganizedLinks || []),
          ].filter((link: LinkType, index: number, all: LinkType[]) =>
            all.findIndex(candidate => candidate.id === link.id) === index
          )
          if (recoveredLinks.length) {
            setLinks(recoveredLinks)
            setPersonalLinks(recoveredLinks)
            setTeamLinks([])
            setLoading(false)
            setHasLoaded(true)
            return
          }
        } catch (error) {
          console.error('Unable to restore the folders snapshot:', error)
        }
      }
    } else {
      console.log('🚫 Cache ignoré - Chargement forcé depuis la DB')
    }

    setLoading(true)
    console.log('🔄 Chargement des liens...')

    try {
      const response = await fetch('/api/links/fast', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })

      if (response.ok) {
        const data = await response.json()

        let allLinks = []

        if (data.links) {
          allLinks = data.links || []
          setPersonalLinks(allLinks)
          setTeamLinks([])
          setHasTeam(false)
          setLinks(allLinks)
        } else if (data.personalLinks !== undefined) {
          setPersonalLinks(data.personalLinks || [])
          setTeamLinks(data.teamLinks || [])
          setHasTeam(data.hasTeam || false)
          allLinks = [...(data.personalLinks || []), ...(data.teamLinks || [])]
          setLinks(allLinks)
        } else {
          allLinks = Array.isArray(data) ? data : []
          setLinks(allLinks)
          setPersonalLinks(allLinks)
          setTeamLinks([])
          setHasTeam(false)
        }

        // ⚡ Sauvegarder dans cache
        localStorage.setItem('links-cache', JSON.stringify({
          data: {
            links: allLinks,
            personalLinks: data.personalLinks || allLinks,
            teamLinks: data.teamLinks || [],
            hasTeam: data.hasTeam || false
          },
          timestamp: Date.now()
        }))

        console.log('✅ Liens chargés:', allLinks.length)
      } else {
        console.error('❌ Erreur serveur:', response.status)
      }
    } catch (error) {
      console.error('❌ Erreur de chargement:', error)
    } finally {
      setLoading(false)
      setHasLoaded(true)
    }
  }

  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/folders')
      if (response.ok) {
        const data = await response.json()
        setFolders(data)
        console.log('✅ Dossiers chargés:', data.length)
      }
    } catch (error) {
      console.error('❌ Erreur chargement dossiers:', error)
    }
  }

  const refreshLinks = async () => {
    // ⚡ Invalider le cache avant de recharger
    localStorage.removeItem('links-cache')
    await fetchLinks()
  }

  const refreshFolders = async () => {
    await fetchFolders()
  }

  const refreshAll = async (skipCache: boolean = true) => {
    console.log('🔄 Rafraîchissement global')
    // ⚡ Invalider tous les caches
    localStorage.removeItem('links-cache')
    localStorage.removeItem('dashboard-stats')
    localStorage.removeItem('folder-stats')
    await Promise.all([fetchLinks(skipCache), fetchFolders()])
  }

  const forceRefresh = () => {
    console.log('🔄 Rafraîchissement forcé')
    refreshAll()
  }

  const incrementLinkClicks = (linkId: string) => {
    setLinks(prevLinks =>
      prevLinks.map(link =>
        link.id === linkId
          ? { ...link, clicks: (link.clicks || 0) + 1 }
          : link
      )
    )
  }

  const updateLinkOptimistic = (linkId: string, updates: Partial<LinkType>) => {
    // Mise à jour optimiste instantanée du state local
    setLinks(prevLinks =>
      prevLinks.map(link =>
        link.id === linkId
          ? { ...link, ...updates }
          : link
      )
    )
    setPersonalLinks(prevLinks =>
      prevLinks.map(link =>
        link.id === linkId
          ? { ...link, ...updates }
          : link
      )
    )
    setTeamLinks(prevLinks =>
      prevLinks.map(link =>
        link.id === linkId
          ? { ...link, ...updates }
          : link
      )
    )
  }

  // Chargement initial UNIQUE
  useEffect(() => {
    // Charger une seule fois au montage
    if (!hasLoaded) {
      console.log('🚀 Chargement initial des données')
      fetchLinks(false)
    }
  }, []) // Dépendances vides = une seule fois

  // Optionnel : Recharger quand on revient sur l'onglet
  useEffect(() => {
    const handleFocus = () => {
      // Recharger seulement si on a déjà chargé et qu'on n'est pas en train de charger
      if (hasLoaded && !loading) {
        console.log('🔄 Rafraîchissement au focus')
        fetchLinks()
      }
    }

    // Décommenter si vous voulez le rafraîchissement au focus
    // window.addEventListener('focus', handleFocus)

    return () => {
      // window.removeEventListener('focus', handleFocus)
    }
  }, [hasLoaded, loading])

  return (
    <LinksContext.Provider value={{
      links,
      personalLinks,
      teamLinks,
      folders,
      loading,
      hasTeam,
      refreshLinks,
      refreshFolders,
      refreshAll,
      forceRefresh,
      incrementLinkClicks,
      updateLinkOptimistic
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
