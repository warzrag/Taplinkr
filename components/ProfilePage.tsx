'use client'

import { useState } from 'react'

interface Link {
  id: string
  title: string
  url: string
  description?: string
  icon?: string
  _count: {
    clicks: number
  }
}

interface User {
  id: string
  username: string
  name?: string
  email: string
  image?: string
  links: Link[]
}

interface ProfilePageProps {
  user: User
}

export default function ProfilePage({ user }: ProfilePageProps) {
  const handleLinkClick = async (linkId: string, url: string) => {
    // Enregistrer le clic
    try {
      await fetch('/api/clicks', {
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          {/* Avatar */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#8b5cf6'
          }}>
            {user.image ? (
              <img 
                src={user.image} 
                alt={user.name || user.username}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              (user.name || user.username).charAt(0).toUpperCase()
            )}
          </div>

          {/* Name */}
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: 'white',
            margin: '0 0 8px 0',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            {user.name || user.username}
          </h1>

          {/* Username */}
          <p style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.8)',
            margin: '0 0 8px 0'
          }}>
            @{user.username}
          </p>

          {/* Stats */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            padding: '8px 16px',
            borderRadius: '20px',
            color: 'white',
            fontSize: '14px'
          }}>
            <span>🔗</span>
            {user.links.length} lien{user.links.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Links */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {user.links.length === 0 ? (
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '48px 24px',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔗</div>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#1f2937',
                margin: '0 0 8px 0'
              }}>
                Aucun lien disponible
              </h3>
              <p style={{ 
                color: '#6b7280',
                margin: 0,
                fontSize: '16px'
              }}>
                {user.name || user.username} n'a pas encore ajouté de liens.
              </p>
            </div>
          ) : (
            user.links.map((link) => (
              <div
                key={link.id}
                onClick={() => handleLinkClick(link.id, link.url)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  {/* Icon */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0
                  }}>
                    {link.icon || '🔗'}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 4px 0'
                    }}>
                      {link.title}
                    </h3>
                    {link.description && (
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: '0 0 8px 0'
                      }}>
                        {link.description}
                      </p>
                    )}
                    <div style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <span>🌐 {new URL(link.url).hostname}</span>
                      <span>👁️ {link._count.clicks} vue{link._count.clicks !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div style={{
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8b5cf6',
                    fontSize: '16px',
                    flexShrink: 0
                  }}>
                    →
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '48px',
          padding: '24px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '14px'
          }}>
            <span>Créé avec</span>
            <div style={{
              width: '20px',
              height: '20px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              G
            </div>
            <span>GetAllMyLinks</span>
          </div>
        </div>
      </div>
    </div>
  )
}