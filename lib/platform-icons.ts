import {
  siDiscord,
  siFacebook,
  siGithub,
  siInstagram,
  siOnlyfans,
  siPatreon,
  siReddit,
  siSnapchat,
  siSpotify,
  siTelegram,
  siTiktok,
  siTwitch,
  siX,
  siYoutube,
} from 'simple-icons'

type SimpleIcon = {
  hex: string
  path: string
  slug: string
}

export interface KnownPlatform {
  pattern: RegExp
  name: string
  home: string
  icon: string
}

function iconDataUri(icon: SimpleIcon) {
  // White keeps monochrome marks readable on Taplinkr's coloured button tiles.
  const fill = ['github', 'x', 'tiktok'].includes(icon.slug) ? 'FFFFFF' : icon.hex
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#${fill}" d="${icon.path}"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const KNOWN_PLATFORMS: KnownPlatform[] = [
  { pattern: /(^|\.)instagram\.com$/i, name: 'Instagram', home: 'https://www.instagram.com/', icon: iconDataUri(siInstagram) },
  { pattern: /(^|\.)tiktok\.com$/i, name: 'TikTok', home: 'https://www.tiktok.com/', icon: iconDataUri(siTiktok) },
  { pattern: /(^|\.)youtube\.com$|(^|\.)youtu\.be$/i, name: 'YouTube', home: 'https://www.youtube.com/', icon: iconDataUri(siYoutube) },
  { pattern: /(^|\.)twitter\.com$|(^|\.)x\.com$/i, name: 'X', home: 'https://x.com/', icon: iconDataUri(siX) },
  { pattern: /(^|\.)telegram\.me$|(^|\.)t\.me$/i, name: 'Telegram', home: 'https://telegram.org/', icon: iconDataUri(siTelegram) },
  { pattern: /(^|\.)spotify\.com$/i, name: 'Spotify', home: 'https://www.spotify.com/', icon: iconDataUri(siSpotify) },
  { pattern: /(^|\.)onlyfans\.com$/i, name: 'OnlyFans', home: 'https://onlyfans.com/', icon: iconDataUri(siOnlyfans) },
  { pattern: /(^|\.)github\.com$/i, name: 'GitHub', home: 'https://github.com/', icon: iconDataUri(siGithub) },
  { pattern: /(^|\.)twitch\.tv$/i, name: 'Twitch', home: 'https://www.twitch.tv/', icon: iconDataUri(siTwitch) },
  { pattern: /(^|\.)discord\.(com|gg)$/i, name: 'Discord', home: 'https://discord.com/', icon: iconDataUri(siDiscord) },
  { pattern: /(^|\.)snapchat\.com$/i, name: 'Snapchat', home: 'https://www.snapchat.com/', icon: iconDataUri(siSnapchat) },
  { pattern: /(^|\.)reddit\.com$/i, name: 'Reddit', home: 'https://www.reddit.com/', icon: iconDataUri(siReddit) },
  { pattern: /(^|\.)facebook\.com$/i, name: 'Facebook', home: 'https://www.facebook.com/', icon: iconDataUri(siFacebook) },
  { pattern: /(^|\.)patreon\.com$/i, name: 'Patreon', home: 'https://www.patreon.com/', icon: iconDataUri(siPatreon) },
]

export function detectKnownPlatformHost(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/\.$/, '')
  return KNOWN_PLATFORMS.find(platform => platform.pattern.test(normalized)) || null
}

export function getKnownPlatformForUrl(value?: string | null) {
  if (!value) return null
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)
    return detectKnownPlatformHost(url.hostname)
  } catch {
    return null
  }
}
