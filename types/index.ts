export interface MultiLink {
  id: string
  title: string
  url: string
  description?: string
  icon?: string
  order: number
  clicks: number
  createdAt: string
  updatedAt: string
}

export interface Link {
  id: string
  slug: string
  title: string
  description?: string
  color?: string
  icon?: string
  coverImage?: string
  isActive: boolean
  order: number
  clicks: number
  createdAt: string
  updatedAt: string
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