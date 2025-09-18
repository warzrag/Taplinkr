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
  // Charger les liens depuis le cache au démarrage
  const getInitialLinks = () => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('taplinkr_links_cache')
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          console.log('📦 Cache trouvé:', parsed.length, 'liens')
          return parsed
        } catch (e) {
          console.error('Erreur cache:', e)
        }
      }
    }
    return []
  }
  
  const [links, setLinks] = useState<LinkType[]>(getInitialLinks())
  const [personalLinks, setPersonalLinks] = useState<LinkType[]>([])
  const [teamLinks, setTeamLinks] = useState<LinkType[]>([])
  const [hasTeam, setHasTeam] = useState(false)
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isFetching, setIsFetching] = useState(false) // Nouveau flag pour éviter les appels multiples

  const fetchLinks = async (retryCount = 0) => {
    // Éviter les appels multiples simultanés
    if (isFetching && retryCount === 0) {
      console.log('⏸️ Fetch déjà en cours, ignoré')
      return false
    }

    setIsFetching(true)
    try {
      // Utiliser la nouvelle API qui retourne les liens personnels et d'équipe
      const response = await fetch('/api/links', {
        // Ajouter un timeout de 10 secondes
        signal: AbortSignal.timeout(10000)
      })

      if (response.ok) {
        const data = await response.json()

        // Gérer les liens personnels
        if (data.personalLinks && Array.isArray(data.personalLinks)) {
          console.log('✅ LinksContext - Links personnels chargés:', data.personalLinks.length)
          setPersonalLinks(data.personalLinks)
        }

        // Gérer les liens d'équipe
        if (data.teamLinks && Array.isArray(data.teamLinks)) {
          console.log('✅ LinksContext - Links d\'équipe chargés:', data.teamLinks.length)
          setTeamLinks(data.teamLinks)
        }

        // Définir si l'utilisateur a une équipe
        setHasTeam(data.hasTeam || false)

        // Combiner tous les liens pour la compatibilité
        const allLinks = [...(data.personalLinks || []), ...(data.teamLinks || [])]
        setLinks(allLinks)

        // Sauvegarder dans le cache
        if (typeof window !== 'undefined' && allLinks.length > 0) {
          localStorage.setItem('taplinkr_links_cache', JSON.stringify(allLinks))
          console.log('💾 Cache mis à jour')
        }

        // IMPORTANT: Retourner true et SORTIR de la fonction après succès
        setIsFetching(false) // Libérer le flag
        setLoading(false) // Arrêter le loading
        return true // Succès - Ne pas faire de retry!
      } else {
        console.error('❌ LinksContext - Erreur serveur:', response.status)
      }
    } catch (error) {
      console.error('❌ LinksContext - Erreur:', error)
    }

    // Réessayer SEULEMENT en cas d'échec
    if (retryCount < 5) {
      const delay = (retryCount + 1) * 500 // 0.5s, 1s, 1.5s...
      console.log(`🔄 Tentative ${retryCount + 1}/5 dans ${delay}ms...`)
      setTimeout(() => fetchLinks(retryCount + 1), delay)
    } else if (links.length === 0) {
      console.error('❌ Tentatives échouées, utilisation de la route de secours')
      // Dernière tentative avec la route de secours
      try {
        const backupResponse = await fetch('/api/links-backup')
        if (backupResponse.ok) {
          const backupData = await backupResponse.json()
          if (Array.isArray(backupData) && backupData.length > 0) {
            console.log('🆘 Données de secours chargées')
            setLinks(backupData)
          }
        }
      } catch (e) {
        console.error('❌ Même la route de secours a échoué:', e)
      }
    }

    setIsFetching(false) // Libérer le flag en cas d'échec final
    setLoading(false) // Arrêter le loading
    return false
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
    setLoading(true) // Indiquer qu'on charge
    await Promise.all([fetchLinks(), fetchFolders()])
    setLoading(false)
    setInitialLoadDone(true) // Marquer le chargement initial comme fait
  }

  const forceRefresh = () => {
    console.log('🔄 LinksContext - forceRefresh appelé')
    setRefreshKey(prev => prev + 1)
    refreshAll()
  }

  const incrementLinkClicks = (linkId: string) => {
    console.log('📈 LinksContext - Incrémentation des clics pour:', linkId)
    setLinks(prevLinks => 
      prevLinks.map(link => 
        link.id === linkId 
          ? { ...link, clicks: (link.clicks || 0) + 1 }
          : link
      )
    )
  }

  useEffect(() => {
    // Charger immédiatement au montage du composant
    console.log('🚀 LinksContext - Chargement initial, cache:', links.length, 'liens')

    // Charger les données une seule fois au démarrage
    if (!initialLoadDone && !isFetching) {
      refreshAll()
    }
    
    // Rafraîchir quand on revient sur l'onglet (optionnel)
    const handleFocus = () => {
      // Ne rafraîchir que si le chargement initial est terminé
      if (initialLoadDone) {
        console.log('🔄 Onglet actif - Rafraîchissement des liens')
        fetchLinks()
      }
    }
    
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, []) // Vide = exécuté une seule fois au montage

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