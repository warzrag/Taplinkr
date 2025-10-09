'use client'

import { useState } from 'react'
import { Link as LinkType } from '@/types'
import { ExternalLink, Eye, EyeOff, Shield, GripVertical, Edit, Trash2, Copy, CheckCircle, XCircle, Loader2, Folder, BarChart3, Calendar, Link2, MoreVertical, Zap, Layers, Edit3 } from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useLinks } from '@/contexts/LinksContext'
import PreviewEditButton from './PreviewEditButton'

interface LinkCardProps {
  link: LinkType
  onToggle: (id: string, isActive: boolean) => void
  onEdit: (link: LinkType) => void
  onDelete: (id: string) => void
  onMoveToFolder?: (link: LinkType) => void
  onRemoveFromFolder?: (linkId: string) => void
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
  onRemoveFromFolder,
  isDragging,
  listeners,
  attributes
}: LinkCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const { incrementLinkClicks, refreshLinks } = useLinks()

  const handleToggle = async () => {
    onToggle(link.id, !link.isActive)
  }

  const handleRename = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const currentName = link.internalName || link.title
    const newName = prompt('Nom interne du lien:', currentName)
    if (newName === null || newName === currentName) return

    try {
      const response = await fetch(`/api/links/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalName: newName.trim() || null })
      })

      if (response.ok) {
        // Vider le cache pour forcer le rechargement immédiat
        localStorage.removeItem('links-cache')
        localStorage.removeItem('dashboard-stats')
        await refreshLinks()
      } else {
        alert('Erreur lors du renommage')
      }
    } catch (error) {
      alert('Erreur lors du renommage du lien')
    }
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
      
      // Ne plus tracker le clic lors de la copie
      // Le tracking se fera uniquement lors de l'ouverture du lien
      
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
        relative group rounded-xl sm:rounded-2xl p-0.5 sm:p-1 mb-3 sm:mb-4 transition-all duration-300
        ${isDragging ? 'scale-105 rotate-1' : 'hover:scale-[1.01] sm:hover:scale-[1.02]'}
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
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-5 shadow-sm backdrop-blur-sm">
        {/* Drag Handle */}
        <div 
          className="absolute -left-3 sm:-left-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-grab active:cursor-grabbing hidden sm:block"
          {...listeners}
          {...attributes}
        >
          <div className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-lg p-1 sm:p-1.5 shadow-lg border border-gray-200/50 dark:border-gray-600/50">
            <GripVertical size={16} className="text-gray-500 dark:text-gray-400 sm:w-[18px] sm:h-[18px]" />
          </div>
        </div>

      <div className="flex items-start justify-between">
        {/* Left Section - Main Content */}
        <div className="flex-1 pr-2 sm:pr-4">
          {/* Header with Title and Icon */}
          <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
            {/* Icon/Image */}
            <div className="flex-shrink-0">
              {link.coverImage ? (
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow duration-300">
                  <Image
                    src={link.coverImage}
                    alt={link.title}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ) : link.icon ? (
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-lg sm:text-2xl filter drop-shadow-sm">{link.icon}</span>
                </div>
              ) : (
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300">
                  <Link2 size={20} className="text-white sm:w-6 sm:h-6" />
                </div>
              )}
            </div>

            {/* Title and URL */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                  {link.internalName || link.title}
                </h3>
                <button
                  onClick={handleRename}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors opacity-0 group-hover:opacity-100"
                  title="Renommer le lien"
                >
                  <Edit3 size={14} className="text-gray-400 hover:text-indigo-600" />
                </button>
                {link.internalName && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 italic truncate">
                    ({link.title})
                  </span>
                )}
                {/* Badges de protection - Plus gros et plus visibles */}
                {link.isDirect && !link.shieldEnabled && !link.isUltraLink && (
                  <div className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center gap-1.5 shadow-sm border border-gray-200 dark:border-gray-600" title="Direct Link - Niveau 1">
                    <ExternalLink size={16} className="text-gray-700 dark:text-gray-300" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">DIRECT LINK</span>
                  </div>
                )}
                {link.isDirect && link.shieldEnabled && !link.isUltraLink && (() => {
                  const level = link.shieldConfig ? JSON.parse(link.shieldConfig).level || 2 : 2
                  const levelStyles = {
                    1: {
                      bg: "from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40",
                      border: "border-green-300 dark:border-green-700",
                      text: "text-green-700 dark:text-green-300"
                    },
                    2: {
                      bg: "from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40",
                      border: "border-blue-300 dark:border-blue-700",
                      text: "text-blue-700 dark:text-blue-300"
                    },
                    3: {
                      bg: "from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40",
                      border: "border-orange-300 dark:border-orange-700",
                      text: "text-orange-700 dark:text-orange-300"
                    }
                  }
                  const style = levelStyles[level] || levelStyles[2]
                  
                  const levelDescriptions = {
                    1: "Protection basique - Timer simple",
                    2: "Protection standard - Timer 3s + Redirection auto",
                    3: "Protection élevée - Timer 5s + Validation manuelle"
                  }
                  
                  return (
                    <div 
                      className={`px-3 py-1.5 bg-gradient-to-r ${style.bg} rounded-lg flex items-center gap-1.5 shadow-sm border ${style.border}`}
                      title={levelDescriptions[level] || levelDescriptions[2]}
                    >
                      <Shield size={16} className={style.text} />
                      <span className={`text-sm font-semibold ${style.text}`}>
                        SHIELD LVL {level}
                      </span>
                    </div>
                  )
                })()}
                {link.isDirect && link.isUltraLink && (
                  <div className="px-3 py-1.5 bg-gradient-to-r from-purple-200 via-pink-200 to-orange-200 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-orange-900/40 rounded-lg flex items-center gap-1.5 shadow-md border border-purple-300 dark:border-purple-700 animate-pulse" title="Protection maximale - Timer 5s + Contenu adaptatif + Obfuscation JS">
                    <Zap size={16} className="text-purple-700 dark:text-purple-300" />
                    <span className="text-sm font-bold bg-gradient-to-r from-purple-700 to-pink-700 dark:from-purple-300 dark:to-pink-300 bg-clip-text text-transparent">ULTRA LVL 3</span>
                  </div>
                )}
                {!link.isDirect && (
                  <div className="px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-lg flex items-center gap-1.5 shadow-sm border border-indigo-300 dark:border-indigo-700" title="Multi-liens">
                    <Layers size={16} className="text-indigo-700 dark:text-indigo-300" />
                    <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">MULTI-LINK</span>
                  </div>
                )}
              </div>
              
              {/* URL with copy button */}
              <div className="flex items-center gap-1 sm:gap-2 group/url bg-gray-50 dark:bg-gray-700 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 max-w-fit">
                <Link2 size={12} className="text-gray-400 dark:text-gray-500 sm:w-[14px] sm:h-[14px]" />
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate max-w-[120px] sm:max-w-none">
                  /{link.slug}
                </p>
                <button
                  onClick={handleCopyLink}
                  className={`
                    ml-1 sm:ml-2 p-0.5 sm:p-1 rounded-md transition-all duration-200
                    ${isCopied ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}
                  `}
                  title={isCopied ? 'Copié !' : 'Copier le lien'}
                >
                  {isCopied ? <CheckCircle size={12} className="sm:w-[14px] sm:h-[14px]" /> : <Copy size={12} className="sm:w-[14px] sm:h-[14px]" />}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="flex items-center gap-2 sm:gap-4 mt-3 sm:mt-4 flex-wrap">
            <div className="flex items-center gap-1 sm:gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
              <BarChart3 size={12} className="text-indigo-600 dark:text-indigo-400 sm:w-[14px] sm:h-[14px]" />
              <span className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400">{link.clicks || 0}</span>
              <span className="text-xs sm:text-sm text-indigo-500 dark:text-indigo-400 hidden sm:inline">clics</span>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 bg-gray-50 dark:bg-gray-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
              <Calendar size={12} className="text-gray-500 dark:text-gray-400 sm:w-[14px] sm:h-[14px]" />
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{formatDate(link.createdAt)}</span>
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
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Toggle Switch */}
          <button
            onClick={handleToggle}
            className={`
              relative inline-flex h-6 w-11 sm:h-7 sm:w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-inner
              ${link.isActive ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gray-300 dark:bg-gray-600'}
            `}
            title={link.isActive ? 'Désactiver' : 'Activer'}
          >
            <span
              className={`
                inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white shadow-lg transition-all duration-300
                ${link.isActive ? 'translate-x-6 sm:translate-x-7' : 'translate-x-1'}
              `}
            />
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {link.isDirect ? (
              <button
                onClick={handleEdit}
                className="p-1.5 sm:p-2.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg sm:rounded-xl transition-all duration-200 hover:shadow-md"
                title="Modifier"
              >
                <Edit size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            ) : (
              <div className="scale-90 sm:scale-100">
                <PreviewEditButton onClick={handleEdit} variant="option4" />
              </div>
            )}
            
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
                  {link.folderId && onRemoveFromFolder && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveFromFolder(link.id)
                        setShowMenu(false)
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors duration-200"
                    >
                      <Folder size={16} />
                      Retirer du dossier
                    </button>
                  )}
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