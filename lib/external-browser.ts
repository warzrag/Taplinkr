export type MobilePlatform = 'ios' | 'android' | 'other'

export function isInstagramInAppBrowser(userAgent: string, referer = ''): boolean {
  return /Instagram/i.test(userAgent)
    || /^https?:\/\/(?:www\.)?instagram\.com(?:\/|$)/i.test(referer)
}

export function isInAppBrowser(userAgent: string, referer = ''): boolean {
  if (/bot|crawler|spider|preview/i.test(userAgent)) return false

  if (/Instagram|FBAN|FBAV|TikTok|musical_ly|Twitter|TwitterAndroid|LinkedInApp|Snapchat/i.test(userAgent)) {
    return true
  }

  const isMobileWebKit = /iPhone|iPad|iPod|Android/i.test(userAgent)
  const isSocialRedirect = /^https?:\/\/(?:t\.co|(?:www\.)?(?:x|twitter|instagram)\.com)(?:\/|$)/i.test(referer)
  return isMobileWebKit && isSocialRedirect
}

export function getMobilePlatform(userAgent: string): MobilePlatform {
  if (/iPad|iPhone|iPod/i.test(userAgent)) return 'ios'
  if (/Android/i.test(userAgent)) return 'android'
  return 'other'
}

export function getInstagramExternalBrowserUrl(currentUrl: string): string {
  return `instagram://extbrowser/?url=${encodeURIComponent(currentUrl)}`
}

export function getExternalBrowserUrl(currentUrl: string, platform: MobilePlatform): string | null {
  const url = new URL(currentUrl)

  if (platform === 'ios') {
    return `x-safari-${url.protocol}//${url.host}${url.pathname}${url.search}${url.hash}`
  }

  if (platform === 'android') {
    const target = `${url.host}${url.pathname}${url.search}`
    return `intent://${target}#Intent;scheme=${url.protocol.slice(0, -1)};action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end`
  }

  return null
}
