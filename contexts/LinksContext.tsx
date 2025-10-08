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
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  // Fonction simplifiée sans retry automatique
  const fetchLinks = async () => {
    // Éviter les appels multiples
    if (loading) {
      console.log('⏸️ Chargement déjà en cours')
      return
    }

    // ⚡ INSTANT: Charger depuis cache d'abord
    const cached = localStorage.getItem('links-cache')
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached)
        // Cache valide pendant 2 minutes
        if (Date.now() - timestamp < 120000) {
          setLinks(data.links || [])
          setPersonalLinks(data.personalLinks || [])
          setTeamLinks(data.teamLinks || [])
          setHasTeam(data.hasTeam || false)
          setLoading(false)
          setHasLoaded(true)
          console.log('⚡ Liens chargés depuis cache:', data.links?.length || 0)
        }
      } catch (e) {
        console.error('Cache invalide:', e)
      }
    }

    // Ne pas afficher loading si on a du cache
    if (!cached) {
      setLoading(true)
    }
    console.log('🔄 Chargement des liens...')

    try {
      const response = await fetch('/api/links/fast')

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

  const refreshAll = async () => {
    console.log('🔄 Rafraîchissement global')
    // ⚡ Invalider tous les caches
    localStorage.removeItem('links-cache')
    localStorage.removeItem('dashboard-stats')
    localStorage.removeItem('folder-stats')
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