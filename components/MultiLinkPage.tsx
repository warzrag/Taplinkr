'use client'

import { useState } from 'react'
import { ExternalLink, ArrowLeft, Eye } from 'lucide-react'
import Image from 'next/image'
import BeaconStyleCard from '@/components/BeaconStyleCard'

interface MultiLink {
  id: string
  title: string
  url: string
  description?: string
  icon?: string
  order: number
  clicks: number
}

interface Link {
  id: string
  slug: string
  title: string
  description?: string
  color?: string
  icon?: string
  coverImage?: string
  clicks: number
  multiLinks: MultiLink[]
  user: {
    id: string
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
  }
}

interface MultiLinkPageProps {
  link: Link
  profile?: {
    template: any
    customCSS?: string | null
    layout?: any
    seo?: any
  }
}

export default function MultiLinkPage({ link, profile }: MultiLinkPageProps) {
  const [clickedLinks, setClickedLinks] = useState<Set<string>>(new Set())

  const handleLinkClick = async (multiLinkId: string, url: string) => {
    // Marquer comme cliqué pour l'animation
    setClickedLinks(prev => new Set(prev).add(multiLinkId))

    // Enregistrer le clic
    try {
      await fetch('/api/track-multilink-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ multiLinkId })
      })
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du clic:', error)
    }

    // Rediriger
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const sortedLinks = [...link.multiLinks].sort((a, b) => a.order - b.order)

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Background avec l'image de l'utilisateur ou gradient */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: link.user.image 
            ? `url(${link.user.image})` 
            : undefined,
          backgroundColor: link.user.primaryColor || '#1f2937'
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-sm">
          {/* Photo de profil */}
          <div className="text-center mb-6">
            <div className="w-32 h-32 mx-auto mb-4 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl">
              {link.user.image ? (
                <Image
                  src={link.user.image}
                  alt={link.user.name || link.user.username}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {(link.user.name || link.user.username).charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Nom */}
            <h1 className="text-3xl font-bold text-white mb-2">
              {link.user.name || link.user.username}
            </h1>

            {/* Bio/Description */}
            {(link.user.bio || link.description) && (
              <p className="text-white/80 text-sm mb-4 px-4">
                {link.user.bio || link.description}
              </p>
            )}

            {/* Icône Instagram si URL présente */}
            {link.user.instagramUrl && (
              <a 
                href={link.user.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mb-6 text-white/80 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
              </a>
            )}
          </div>

          {/* Liste des liens */}
          <div className="space-y-4">
            {sortedLinks.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                <div className="text-4xl mb-2">🔗</div>
                <p className="text-white/90 text-sm">
                  Aucun lien disponible pour le moment
                </p>
              </div>
            ) : (
              sortedLinks.map((multiLink) => (
                <BeaconStyleCard
                  key={multiLink.id}
                  link={{
                    id: multiLink.id,
                    title: multiLink.title,
                    url: multiLink.url,
                    description: multiLink.description,
                    icon: multiLink.icon
                  }}
                  onClick={() => handleLinkClick(multiLink.id, multiLink.url)}
                  isClicked={clickedLinks.has(multiLink.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}