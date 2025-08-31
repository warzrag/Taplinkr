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
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchLinks = async (retryCount = 0) => {
    try {
      // Utiliser la route PostgreSQL finale avec la bonne structure
      const response = await fetch('/api/links-final', {
        // Ajouter un timeout de 10 secondes
        signal: AbortSignal.timeout(10000)
      })
      
      if (response.ok) {
        const data = await response.json()
        // Vérifier que c'est bien un tableau avant de mettre à jour
        if (Array.isArray(data)) {
          console.log('✅ LinksContext - Links chargés:', data.length)
          setLinks(data)
          // Sauvegarder dans le cache
          if (typeof window !== 'undefined' && data.length > 0) {
            localStorage.setItem('taplinkr_links_cache', JSON.stringify(data))
            console.log('💾 Cache mis à jour')
          }
          return true // Succès
        } else {
          console.error('❌ LinksContext - Réponse invalide (pas un tableau)')
        }
      } else {
        console.error('❌ LinksContext - Erreur serveur:', response.status)
      }
    } catch (error) {
      console.error('❌ LinksContext - Erreur:', error)
    }
    
    // Réessayer jusqu'à 5 fois avec un délai croissant
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
    
    // Toujours rafraîchir depuis le serveur pour avoir les dernières données
    refreshAll()
    
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
      folders,
      loading,
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