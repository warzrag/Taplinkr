export interface MultiLink {
  id: string
  title: string
  url: string
  description?: string
  icon?: string
  iconImage?: string
  animation?: string
  order: number
  clicks: number
  createdAt: string
  updatedAt: string
}

export interface Link {
  id: string
  slug: string
  title: string
  internalName?: string
  description?: string
  color?: string
  icon?: string
  coverImage?: string
  coverImagePosition?: string
  profileImage?: string
  fontFamily?: string
  borderRadius?: string
  backgroundColor?: string
  textColor?: string
  isActive: boolean
  isDirect: boolean
  directUrl?: string
  shieldEnabled?: boolean
  isUltraLink?: boolean
  shieldConfig?: string
  isOnline?: boolean
  city?: string
  country?: string
  instagramUrl?: string
  tiktokUrl?: string
  twitterUrl?: string
  youtubeUrl?: string
  order: number
  clicks: number
  views: number
  createdAt: string
  updatedAt: string
  folderId?: string
  multiLinks?: MultiLink[]
  user?: {
    id: string
    username: string
    name?: string
    image?: string
  }
}

export interface User {
  id: string
  email: string
  username: string
  name?: string
  image?: string
  bio?: string
  bannerImage?: string
  theme?: string
  primaryColor?: string
  secondaryColor?: string
  backgroundImage?: string
  twitterUrl?: string
  instagramUrl?: string
  linkedinUrl?: string
  youtubeUrl?: string
  tiktokUrl?: string
  createdAt: string
  updatedAt: string
  links?: Link[]
}