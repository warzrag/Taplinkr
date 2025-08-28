'use client'

import { useState } from 'react'
import { ExternalLink, Share2, Heart, Eye } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface MultiLink {
  id: string
  title: string
  url: string
  description?: string | null
  order: number
  clicks: number
}

interface PublicLinkPreviewProps {
  link: {
    id: string
    slug: string
    title: string
    description?: string | null
    bio?: string | null
    profileImage?: string | null
    coverImage?: string | null
    clicks: number
    multiLinks: MultiLink[]
    user: {
      username: string
      name?: string | null
      image?: string | null
      bio?: string | null
    }
  }
}

export default function PublicLinkPreviewSimple({ link }: PublicLinkPreviewProps) {
  const [clickedLinks, setClickedLinks] = useState<Set<string>>(new Set())

  const handleLinkClick = async (multiLinkId: string, url: string) => {
    setClickedLinks(prev => new Set(prev).add(multiLinkId))
    
    try {
      await fetch('/api/track-multilink-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ multiLinkId })
      })
    } catch (error) {
      console.error('Erreur lors du tracking:', error)
    }

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleShare = async () => {
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: link.title,
          text: link.description || link.bio || '',
          url: url
        })
      } catch (err) {
        console.error('Erreur lors du partage:', err)
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Lien copié dans le presse-papiers!')
    }
  }

  const profileImage = link.profileImage || link.user.image
  const coverImage = link.coverImage

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Cover Image */}
      {coverImage && (
        <div className="w-full h-48 md:h-64 relative">
          <img 
            src={coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Profile Section */}
        <div className="text-center mb-8">
          {profileImage && (
            <img
              src={profileImage}
              alt={link.title}
              className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full border-4 border-white shadow-xl mb-4"
            />
          )}
          
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {link.title}
          </h1>
          
          {(link.description || link.bio) && (
            <p className="text-gray-600 text-sm md:text-base max-w-md mx-auto mb-4">
              {link.description || link.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex justify-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{link.clicks} vues</span>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Partager</span>
            </button>
          </div>
        </div>

        {/* Links Section */}
        <div className="space-y-3">
          {link.multiLinks && link.multiLinks.length > 0 ? (
            link.multiLinks.map((multiLink) => (
              <button
                key={multiLink.id}
                onClick={() => handleLinkClick(multiLink.id, multiLink.url)}
                className={`
                  w-full p-4 rounded-xl bg-white shadow-md hover:shadow-lg 
                  transform hover:scale-105 transition-all duration-200
                  flex items-center justify-between group
                  ${clickedLinks.has(multiLink.id) ? 'ring-2 ring-purple-500' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      {multiLink.title}
                    </div>
                    {multiLink.description && (
                      <div className="text-sm text-gray-500">
                        {multiLink.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-purple-600">
                  →
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucun lien disponible pour le moment
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Créé avec{' '}
            <a 
              href="https://www.taplinkr.com" 
              className="text-purple-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              TapLinkr
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}