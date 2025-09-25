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
}

const LinksContext = createContext<LinksContextType | undefined>(undefined)

export function LinksProvider({ children }: { children: ReactNode }) {
  const [links, setLinks] = useState<LinkType[]>([])
  const [personalLinks, setPersonalLinks] = useState<LinkType[]>([])
  const [teamLinks, setTeamLinks] = useState<LinkType[]>([])
  const [hasTeam, setHasTeam] = useState(false)
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(false) // Commencer à false
  const [hasLoaded, setHasLoaded] = useState(false) // Pour savoir si on a déjà chargé

  // Fonction simplifiée sans retry automatique
  const fetchLinks = async () => {
    // Éviter les appels multiples
    if (loading) {
      console.log('⏸️ Chargement déjà en cours')
      return
    }

    setLoading(true)
    console.log('🔄 Chargement des liens...')

    try {
      // D'abord essayer l'API rapide
      const response = await fetch('/api/links/fast')

      if (response.ok) {
        const data = await response.json()

        let allLinks = []

        if (data.links) {
          // Format de l'API rapide
          allLinks = data.links || []
          setPersonalLinks(allLinks)
          setTeamLinks([])
          setHasTeam(false)
          setLinks(allLinks)
        } else if (data.personalLinks !== undefined) {
          // Format de l'API classique (fallback)
          setPersonalLinks(data.personalLinks || [])
          setTeamLinks(data.teamLinks || [])
          setHasTeam(data.hasTeam || false)
          allLinks = [...(data.personalLinks || []), ...(data.teamLinks || [])]
          setLinks(allLinks)
        } else {
          // Format simple avec juste un tableau
          allLinks = Array.isArray(data) ? data : []
          setLinks(allLinks)
          setPersonalLinks(allLinks)
          setTeamLinks([])
          setHasTeam(false)
        }

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
    await fetchLinks()
  }

  const refreshFolders = async () => {
    await fetchFolders()
  }

  const refreshAll = async () => {
    console.log('🔄 Rafraîchissement global')
    await Promise.all([fetchLinks(), fetchFolders()])
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

  // Chargement initial UNIQUE
  useEffect(() => {
    // Charger une seule fois au montage
    if (!hasLoaded) {
      console.log('🚀 Chargement initial des données')
      refreshAll()
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
      incrementLinkClicks
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