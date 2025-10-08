'use client'

import { useEffect } from 'react'

export default function InAppBrowserRedirect() {
  useEffect(() => {
    const userAgent = navigator.userAgent || ''
    const isInstagram = userAgent.includes('Instagram')
    const isFacebook = userAgent.includes('FBAN') || userAgent.includes('FBAV')
    const isTikTok = userAgent.includes('TikTok')
    const isInAppBrowser = isInstagram || isFacebook || isTikTok

    if (isInAppBrowser) {
      console.log('🚨 Navigateur in-app détecté - Redirection dans 500ms')

      const isIOS = /iPad|iPhone|iPod/.test(userAgent)
      const isAndroid = /Android/.test(userAgent)
      const currentUrl = window.location.href

      setTimeout(() => {
        if (isIOS) {
          const safariUrl = `x-safari-https://${currentUrl.replace(/^https?:\/\//, '')}`
          console.log('🍎 iOS - Redirection Safari:', safariUrl)
          window.location.href = safariUrl
        } else if (isAndroid) {
          const host = currentUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
          const intentUrl = `intent://${host}#Intent;scheme=https;action=android.intent.action.VIEW;end`
          console.log('🤖 Android - Redirection Chrome:', intentUrl)
          window.location.href = intentUrl
        }
      }, 500)
    }
  }, [])

  return null
}
