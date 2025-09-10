'use client'

import { useEffect } from 'react'

export default function DebugConsole() {
  useEffect(() => {
    // Créer un objet global pour le debug
    if (typeof window !== 'undefined') {
      window.TapLinkrDebug = {
        showInfo: () => {
          console.log('🔍 TapLinkr Debug Info:')
          console.table({
            'URL': window.location.href,
            'User Agent': navigator.userAgent,
            'Screen': `${screen.width}x${screen.height}`,
            'Window': `${innerWidth}x${innerHeight}`,
            'Local Storage Items': localStorage.length,
            'Session Storage Items': sessionStorage.length
          })
        },
        
        checkAPI: async (endpoint = '/api/debug') => {
          try {
            const res = await fetch(endpoint)
            const data = await res.json()
            console.log('✅ API Response:', data)
            return data
          } catch (error) {
            console.error('❌ API Error:', error)
            return error
          }
        },
        
        clearData: () => {
          if (confirm('Effacer toutes les données locales ?')) {
            localStorage.clear()
            sessionStorage.clear()
            console.log('🗑️ Données locales effacées')
            window.location.reload()
          }
        },
        
        toggleDarkMode: () => {
          document.documentElement.classList.toggle('dark')
          console.log('🌓 Mode sombre:', document.documentElement.classList.contains('dark'))
        }
      }
      
      console.log('✨ TapLinkr Debug Console chargée. Tapez: window.TapLinkrDebug.showInfo()')
    }
  }, [])
  
  return null
}