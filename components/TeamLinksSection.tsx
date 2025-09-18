'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Link2,
  Eye,
  MousePointer,
  Calendar,
  UserCheck,
  Shield,
  Crown,
  Star
} from 'lucide-react'
import { Link as LinkType } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'

interface TeamLinksSectionProps {
  links: LinkType[]
  viewMode: 'grid' | 'list'
}

export default function TeamLinksSection({ links, viewMode }: TeamLinksSectionProps) {
  if (links.length === 0) {
    return null
  }

  const getRoleIcon = (link: any) => {
    if (link.originalOwner?.id === link.user?.id) {
      return <Crown className="w-4 h-4 text-yellow-500" title="Propriétaire" />
    }
    return <Users className="w-4 h-4 text-blue-500" title="Membre d'équipe" />
  }

  return (
    <div className="mb-8">
      {/* Header de section */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Liens de l'équipe
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {links.length} lien{links.length > 1 ? 's' : ''} partagé{links.length > 1 ? 's' : ''} avec vous
          </p>
        </div>
      </div>

      {/* Grille ou liste des liens */}
      <div className={viewMode === 'grid' ?
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' :
        'space-y-3'
      }>
        <AnimatePresence mode="popLayout">
          {links.map((link, index) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className={`relative group ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all'
                  : 'bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all flex items-center justify-between'
              }`}
            >
              {/* Badge équipe */}
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center gap-1">
                  {getRoleIcon(link)}
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    Équipe
                  </span>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <>
                  {/* Vue grille */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 mb-1">
                      {link.title}
                    </h4>
                    {link.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {link.description}
                      </p>
                    )}
                  </div>

                  {/* Infos du propriétaire */}
                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
                    <UserCheck className="w-3 h-3" />
                    <span>{link.user?.name || link.user?.email || 'Utilisateur'}</span>
                  </div>

                  {/* Statistiques */}
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{link.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MousePointer className="w-3 h-3" />
                      <span>{link.clicks || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(link.createdAt), 'dd MMM', { locale: fr })}</span>
                    </div>
                  </div>

                  {/* Action principale */}
                  <Link
                    href={`/${link.slug}`}
                    target="_blank"
                    className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all text-center block"
                  >
                    Voir le lien
                  </Link>
                </>
              ) : (
                <>
                  {/* Vue liste */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {link.title[0]?.toUpperCase() || 'L'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {link.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          {link.user?.name || link.user?.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {link.views || 0} vues
                        </span>
                        <span className="flex items-center gap-1">
                          <MousePointer className="w-3 h-3" />
                          {link.clicks || 0} clics
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/${link.slug}`}
                    target="_blank"
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    Voir
                  </Link>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}