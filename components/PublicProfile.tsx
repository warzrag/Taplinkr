'use client'

import { ExternalLink, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react'
import Image from 'next/image'
import { Link as LinkType } from '@/types'

interface User {
  id: string
  username: string
  name?: string
  email: string
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
  links: LinkType[]
}

interface PublicProfileProps {
  user: User
}

export default function PublicProfile({ user }: PublicProfileProps) {
  const handleLinkClick = async (linkId: string, url: string) => {
    // Enregistrer le clic
    try {
      await fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId })
      })
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du clic:', error)
    }

    // Rediriger vers le lien
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Déterminer le style d'arrière-plan
  const getBackgroundStyle = () => {
    const primaryColor = user.primaryColor || '#3b82f6'
    const secondaryColor = user.secondaryColor || '#8b5cf6'
    
    switch (user.theme) {
      case 'solid':
        return { backgroundColor: primaryColor }
      case 'image':
        return user.backgroundImage 
          ? { 
              backgroundImage: `url(${user.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: primaryColor // fallback
            }
          : { background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }
      default: // gradient
        return { background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }
    }
  }

  const backgroundStyle = getBackgroundStyle()

  return (
    <div className="min-h-screen p-4 relative" style={backgroundStyle}>
      {/* Overlay pour les images de fond */}
      {user.theme === 'image' && user.backgroundImage && (
        <div className="absolute inset-0 bg-black/40" />
      )}
      <div className="max-w-md mx-auto relative z-10">
        {/* Bannière */}
        {user.bannerImage && (
          <div className="w-full h-32 rounded-t-2xl overflow-hidden mb-4">
            <Image
              src={user.bannerImage}
              alt="Bannière"
              width={400}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="text-center mb-8">
          {/* Avatar */}
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white/30">
            {user.image ? (
              <Image
                src={user.image} 
                alt={user.name || user.username}
                width={96}
                height={96}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-white">
                {(user.name || user.username).charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Name */}
          <h1 className="text-2xl font-bold text-white mb-2">
            {user.name || user.username}
          </h1>

          {/* Username */}
          <p className="text-white/80 mb-2">
            @{user.username}
          </p>

          {/* Bio */}
          {user.bio && (
            <p className="text-white/90 text-sm mb-4 max-w-xs mx-auto">
              {user.bio}
            </p>
          )}

          {/* Réseaux sociaux */}
          <div className="flex justify-center space-x-4 mb-4">
            {user.twitterUrl && (
              <a
                href={user.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Twitter className="w-5 h-5 text-white" />
              </a>
            )}
            {user.instagramUrl && (
              <a
                href={user.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
            )}
            {user.linkedinUrl && (
              <a
                href={user.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Linkedin className="w-5 h-5 text-white" />
              </a>
            )}
            {user.youtubeUrl && (
              <a
                href={user.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Youtube className="w-5 h-5 text-white" />
              </a>
            )}
          </div>

          {/* Stats */}
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-white/90 text-sm">
              🔗 {user.links.length} lien{user.links.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-4">
          {user.links.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Aucun lien disponible
              </h3>
              <p className="text-white/70">
                {user.name || user.username} n'a pas encore ajouté de liens.
              </p>
            </div>
          ) : (
            user.links
              .filter(link => link.isActive)
              .sort((a, b) => a.order - b.order)
              .map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id, link.url)}
                  className="relative w-full rounded-2xl p-6 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-xl group overflow-hidden"
                  style={{ backgroundColor: link.color || '#3b82f6' }}
                >
                  {/* Cover Image Background */}
                  {link.coverImage && (
                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                      <Image
                        src={link.coverImage}
                        alt={link.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="relative z-10 flex items-center">
                    {/* Icon */}
                    {link.icon && (
                      <div className="mr-4 text-3xl">
                        {link.icon}
                      </div>
                    )}

                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-lg mb-1 group-hover:text-yellow-300 transition-colors">
                        {link.title}
                      </h3>
                      
                      {link.description && (
                        <p className="text-white/90 text-sm mb-2 line-clamp-2">
                          {link.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-white/80">
                        <span className="inline-flex items-center space-x-1">
                          <span>🌐</span>
                          <span>{new URL(link.url).hostname}</span>
                        </span>
                        
                        <span className="inline-flex items-center space-x-1">
                          <span>👁️</span>
                          <span>{link.clicks} vue{link.clicks !== 1 ? 's' : ''}</span>
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="ml-4 flex-shrink-0">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <ExternalLink className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                </button>
              ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pb-8">
          <div className="inline-flex items-center space-x-2 text-white/60 text-sm">
            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
              <span className="text-xs font-bold">G</span>
            </div>
            <span>Créé avec LinkTracker</span>
          </div>
        </div>
      </div>
    </div>
  )
}