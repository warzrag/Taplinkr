'use client'

import { useState } from 'react'
import { Link as LinkType } from '@/types'
import { ExternalLink, Eye, EyeOff, Shield, GripVertical, Edit, Trash2, Copy, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface LinkCardProps {
  link: LinkType
  onToggle: (id: string, isActive: boolean) => void
  onEdit: (link: LinkType) => void
  onDelete: (id: string) => void
  isDragging?: boolean
  listeners?: any
  attributes?: any
}

export default function LinkCard({ 
  link, 
  onToggle, 
  onEdit, 
  onDelete, 
  isDragging,
  listeners,
  attributes 
}: LinkCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const handleToggle = async () => {
    onToggle(link.id, !link.isActive)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(link)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Êtes-vous sûr de vouloir supprimer ce lien ?')) {
      onDelete(link.id)
    }
  }

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Construire l'URL du lien
    const linkUrl = `${window.location.origin}/link/${link.slug}`
    
    try {
      await navigator.clipboard.writeText(linkUrl)
      setIsCopied(true)
      
      // Réinitialiser l'état après 2 secondes
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Erreur lors de la copie:', error)
    }
  }

  const cardStyle = {
    backgroundColor: link.color || '#3b82f6',
    opacity: isDragging ? 0.5 : link.isActive ? 1 : 0.6
  }

  return (
    <div 
      className={`
        relative group rounded-lg p-4 mb-4 transition-all duration-200 cursor-pointer
        ${isDragging ? 'shadow-xl' : 'shadow-md hover:shadow-lg'}
        ${link.isActive ? '' : 'grayscale'}
      `}
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drag Handle */}
      <div 
        className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        {...listeners}
        {...attributes}
      >
        <GripVertical size={20} className="text-white/80" />
      </div>

      {/* Cover Image */}
      {link.coverImage && (
        <div className="absolute inset-0 rounded-lg overflow-hidden">
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
      <div className="relative z-10 text-white ml-8">
        {/* Header with icon and actions */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {link.icon && (
              <span className="text-2xl">{link.icon}</span>
            )}
            {link.shield && (
              <Shield size={16} className="text-yellow-300" />
            )}
          </div>
          
          {/* Actions */}
          <div className={`flex items-center space-x-2 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-100'}`}>
            <button
              onClick={handleCopyLink}
              className={`p-1 hover:bg-white/20 rounded transition-colors ${isCopied ? 'bg-green-500/30' : ''}`}
              title={isCopied ? 'Copié !' : 'Copier le lien'}
            >
              {isCopied ? <CheckCircle size={16} /> : <Copy size={16} />}
            </button>
            <button
              onClick={handleToggle}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title={link.isActive ? 'Désactiver' : 'Activer'}
            >
              {link.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <button
              onClick={handleEdit}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Modifier"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-red-500/50 rounded transition-colors"
              title="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg mb-1 truncate">
          {link.title}
        </h3>

        {/* Description */}
        {link.description && (
          <p className="text-white/90 text-sm mb-3 line-clamp-2">
            {link.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-white/80">
          <div className="flex items-center space-x-4">
            <span>{link.clicks} clics</span>
            <span className="flex items-center space-x-1">
              <ExternalLink size={12} />
              <span className="truncate max-w-32">
                {link.multiLinks && link.multiLinks.length > 0 
                  ? `${link.multiLinks.length} destination${link.multiLinks.length > 1 ? 's' : ''}`
                  : 'MultiLink'
                }
              </span>
            </span>
          </div>
          <div className={`w-2 h-2 rounded-full ${link.isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
        </div>
      </div>
    </div>
  )
}