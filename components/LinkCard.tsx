'use client'

import { useState } from 'react'
import { Link as LinkType } from '@/types'
import { ExternalLink, Eye, EyeOff, Shield, GripVertical, Edit, Trash2, Copy, CheckCircle, XCircle, Loader2, Folder, BarChart3, Calendar, Link2, MoreVertical, Zap, Layers } from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useLinks } from '@/contexts/LinksContext'

interface LinkCardProps {
  link: LinkType
  onToggle: (id: string, isActive: boolean) => void
  onEdit: (link: LinkType) => void
  onDelete: (id: string) => void
  onMoveToFolder?: (link: LinkType) => void
  isDragging?: boolean
  listeners?: any
  attributes?: any
}

export default function LinkCard({ 
  link, 
  onToggle, 
  onEdit, 
  onDelete,
  onMoveToFolder,
  isDragging,
  listeners,
  attributes 
}: LinkCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const { incrementLinkClicks } = useLinks()

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
    const linkUrl = `${window.location.origin}/${link.slug}`
    
    try {
      await navigator.clipboard.writeText(linkUrl)
      setIsCopied(true)
      
      // Tracker le clic et mettre à jour en temps réel
      fetch('/api/track-link-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId: link.id })
      }).then(response => {
        if (response.ok) {
          return response.json()
        }
      }).then(data => {
        if (data && data.success) {
          incrementLinkClicks(link.id)
        }
      }).catch(error => {
        console.error('Erreur tracking:', error)
      })
      
      // Réinitialiser l'état après 2 secondes
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Erreur lors de la copie:', error)
    }
  }

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd MMM yyyy', { locale: fr })
    } catch {
      return ''
    }
  }

  return (
    <div 
      className={`
        relative group rounded-2xl p-1 mb-4 transition-all duration-300
        ${isDragging ? 'scale-105 rotate-1' : 'hover:scale-[1.02]'}
        ${!link.isActive ? 'opacity-60 grayscale' : ''}
        ${!isDragging ? 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800' : ''}
      `}
      style={{
        background: isDragging 
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
          : ''
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm backdrop-blur-sm">
        {/* Drag Handle */}
        <div 
          className="absolute -left-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-grab active:cursor-grabbing"
          {...listeners}
          {...attributes}
        >
          <div className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-lg p-1.5 shadow-lg border border-gray-200/50 dark:border-gray-600/50">
            <GripVertical size={18} className="text-gray-500 dark:text-gray-400" />
          </div>
        </div>

      <div className="flex items-start justify-between">
        {/* Left Section - Main Content */}
        <div className="flex-1 pr-4">
          {/* Header with Title and Icon */}
          <div className="flex items-start gap-3 mb-3">
            {/* Icon/Image */}
            <div className="flex-shrink-0">
              {link.coverImage ? (
                <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow duration-300">
                  <Image
                    src={link.coverImage}
                    alt={link.title}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ) : link.icon ? (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-2xl filter drop-shadow-sm">{link.icon}</span>
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300">
                  <Link2 size={24} className="text-white" />
                </div>
              )}
            </div>

            {/* Title and URL */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                  {link.title}
                </h3>
                {link.isDirect && (
                  <div className="p-1 bg-purple-100 dark:bg-purple-900 rounded-lg" title="Lien direct">
                    <Zap size={16} className="text-purple-600 dark:text-purple-400" />
                  </div>
                )}
                {link.shield && (
                  <div className="p-1 bg-amber-100 rounded-lg">
                    <Shield size={16} className="text-amber-600" title="Lien protégé" />
                  </div>
                )}
              </div>
              
              {/* URL with copy button */}
              <div className="flex items-center gap-2 group/url bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-1.5 max-w-fit">
                <Link2 size={14} className="text-gray-400 dark:text-gray-500" />
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  /{link.slug}
                </p>
                <button
                  onClick={handleCopyLink}
                  className={`
                    ml-2 p-1 rounded-md transition-all duration-200
                    ${isCopied ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}
                  `}
                  title={isCopied ? 'Copié !' : 'Copier le lien'}
                >
                  {isCopied ? <CheckCircle size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg">
              <BarChart3 size={14} className="text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-600">{link.clicks || 0}</span>
              <span className="text-sm text-indigo-500">clics</span>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
              <Calendar size={14} className="text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">{formatDate(link.createdAt)}</span>
            </div>

            {link.isDirect ? (
              <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg">
                <Zap size={14} className="text-purple-600 dark:text-purple-400" />
                <span className="text-sm text-purple-600 dark:text-purple-400">Lien direct</span>
              </div>
            ) : (
              link.multiLinks && link.multiLinks.length > 0 && (
                <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg">
                  <Layers size={14} className="text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{link.multiLinks.length}</span>
                  <span className="text-sm text-purple-500 dark:text-purple-400">liens</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Toggle Switch */}
          <button
            onClick={handleToggle}
            className={`
              relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-inner
              ${link.isActive ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gray-300'}
            `}
            title={link.isActive ? 'Désactiver' : 'Activer'}
          >
            <span
              className={`
                inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300
                ${link.isActive ? 'translate-x-7' : 'translate-x-1'}
              `}
            />
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleEdit}
              className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all duration-200 hover:shadow-md"
              title="Modifier"
            >
              <Edit size={18} />
            </button>
            
            {onMoveToFolder && (
              <button
                onClick={() => onMoveToFolder(link)}
                className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all duration-200 hover:shadow-md"
                title="Déplacer vers un dossier"
              >
                <Folder size={18} />
              </button>
            )}
            
            {/* Menu dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
                onBlur={() => setTimeout(() => setShowMenu(false), 200)}
                className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 hover:shadow-md"
              >
                <MoreVertical size={18} />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-50 overflow-hidden">
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors duration-200"
                  >
                    <Trash2 size={16} />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}