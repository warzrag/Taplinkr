'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'react-hot-toast'

interface ProfileData {
  id?: string
  name?: string
  username?: string
  email?: string
  image?: string
  bio?: string
  bannerImage?: string
  avatarId?: string
  bannerId?: string
  theme?: string
  primaryColor?: string
  secondaryColor?: string
  backgroundImage?: string
  twitterUrl?: string
  instagramUrl?: string
  linkedinUrl?: string
  youtubeUrl?: string
  tiktokUrl?: string
}

interface ProfileContextType {
  profile: ProfileData | null
  loading: boolean
  refreshProfile: () => Promise<void>
  updateProfile: (newData: Partial<ProfileData>) => Promise<boolean>
  forceRefresh: () => void
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        console.log('🔄 ProfileContext - Données rechargées:', data)
        setProfile(data)
      }
    } catch (error) {
      console.error('❌ ProfileContext - Erreur chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    console.log('🔄 ProfileContext - refreshProfile appelé')
    await fetchProfile()
  }

  const updateProfile = async (newData: Partial<ProfileData>): Promise<boolean> => {
    try {
      console.log('💾 ProfileContext - updateProfile appelé avec:', newData)
      
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      })

      if (response.ok) {
        const updatedData = await response.json()
        console.log('✅ ProfileContext - Mise à jour réussie:', updatedData)
        setProfile(updatedData)
        
        // Force la mise à jour de tous les composants
        setRefreshKey(prev => prev + 1)
        
        return true
      } else {
        console.error('❌ ProfileContext - Erreur réponse:', response.status)
        return false
      }
    } catch (error) {
      console.error('❌ ProfileContext - Erreur réseau:', error)
      return false
    }
  }

  const forceRefresh = () => {
    console.log('🔄 ProfileContext - forceRefresh appelé')
    setRefreshKey(prev => prev + 1)
    fetchProfile()
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  // Effect pour surveiller les changements
  useEffect(() => {
    console.log('👀 ProfileContext - Profile changé:', profile)
  }, [profile, refreshKey])

  return (
    <ProfileContext.Provider value={{
      profile,
      loading,
      refreshProfile,
      updateProfile,
      forceRefresh
    }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}