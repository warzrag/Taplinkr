'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Edit2, Trash2, ToggleLeft, ToggleRight, Link2 } from 'lucide-react'
import { Link as LinkType } from '@/types'

interface SimpleLinksGridProps {
  links: LinkType[]
  onToggleLink: (linkId: string, isActive: boolean) => void
  onEditLink: (link: LinkType) => void
  onDeleteLink: (linkId: string) => void
}

export default function SimpleLinksGrid({ 
  links, 
  onToggleLink, 
  onEditLink, 
  onDeleteLink 
}: SimpleLinksGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {links.map((link, index) => (
        <motion.div
          key={link.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {link.icon ? (
                <span className="text-2xl">{link.icon}</span>
              ) : (
                <Link2 className="w-5 h-5 text-gray-400" />
              )}
              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {link.title}
              </h3>
            </div>
            <button
              onClick={() => onToggleLink(link.id, !link.isActive)}
              className={`p-1.5 rounded-lg transition-colors ${
                link.isActive
                  ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {link.isActive ? (
                <ToggleRight className="w-5 h-5" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 truncate">
            /{link.slug}
          </p>

          {link.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
              {link.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {link.clicks || 0} clics
            </span>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEditLink(link)}
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <a
                href={link.isDirect ? link.url : `/${link.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => {
                  if (confirm('Êtes-vous sûr de vouloir supprimer ce lien ?')) {
                    onDeleteLink(link.id)
                  }
                }}
                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
      
      {links.length === 0 && (
        <div className="col-span-full text-center py-12">
          <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun lien créé pour le moment</p>
          <p className="text-sm text-gray-400 mt-1">
            Cliquez sur "Créer un lien" pour commencer
          </p>
        </div>
      )}
    </div>
  )
}