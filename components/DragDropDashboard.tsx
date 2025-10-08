'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Folder as FolderIcon,
  Plus,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  Link2,
  FolderPlus,
  Share2
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import LinkCard from './LinkCard'
import FolderAnalyticsTooltip from './FolderAnalyticsTooltip'
import { useLinks } from '@/contexts/LinksContext'
import { Link as LinkType } from '@/types'

interface Folder {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  isExpanded: boolean
  links: LinkType[]
  order: number
  parentId?: string | null
  children?: Folder[]
  teamShared?: boolean
  teamId?: string | null
}

interface DragDropDashboardProps {
  folders: Folder[]
  unorganizedLinks: LinkType[]
  onFoldersChange: (folders: Folder[]) => void
  onLinksChange: (links: LinkType[]) => void
  onToggleLink: (id: string, isActive: boolean) => void
  onEditLink: (link: LinkType) => void
  onDeleteLink: (id: string) => void
  onMoveLink: (linkId: string, folderId: string | null) => void
  onCreateFolder: () => void
  onEditFolder: (folder: Folder) => void
  onDeleteFolder: (folderId: string) => void
  onToggleFolder: (folderId: string) => void
  onShareFolder?: (folderId: string, folderName: string) => void
  onUnshareFolder?: (folderId: string, folderName: string) => void
  onCreateLinkInFolder?: (folderId: string) => void
}

function SortableFolder({
  folder,
  children,
  onEdit,
  onDelete,
  onToggle,
  onCreateSubfolder,
  onCreateLink,
  onShare,
  onUnshare,
  onMouseEnter,
  onMouseLeave,
  isOver,
  depth = 0
}: {
  folder: Folder
  children: React.ReactNode
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
  onCreateSubfolder: () => void
  onCreateLink?: () => void
  onShare?: () => void
  onUnshare?: () => void
  onMouseEnter?: (event: React.MouseEvent) => void
  onMouseLeave?: () => void
  isOver?: boolean
  depth?: number
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: `folder-${folder.id}`,
    data: {
      type: 'folder',
      folder
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={{
        ...style,
        marginLeft: `${depth * 20}px`,
      }}
      className={`group relative rounded-xl overflow-hidden transition-all duration-150 ${
        isDragging ? 'opacity-50 scale-105 shadow-2xl' : 'hover:shadow-lg'
      } ${isOver ? 'ring-2 ring-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 scale-[1.02]' : 'bg-white border border-gray-100 hover:border-gray-200'}`}
      layout
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* En-tête du dossier */}
      <div 
        className={`flex items-center justify-between p-4 cursor-pointer transition-all duration-100 ${
          isOver ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100'
        }`}
        style={{ 
          background: isOver ? undefined : `linear-gradient(135deg, ${folder.color}08, ${folder.color}15)`,
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center space-x-4" onClick={onToggle}>
          <motion.div
            animate={{ rotate: folder.isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </motion.div>
          
          <div className="flex items-center space-x-3">
            <motion.div
              className="text-2xl select-none flex-shrink-0"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {folder.icon}
            </motion.div>
            
            <div className="select-none min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate">{folder.name}</h3>
              {folder.description && (
                <p className="text-sm text-gray-600 truncate">{folder.description}</p>
              )}
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-xs text-gray-500 flex items-center">
                  <Link2 className="w-3 h-3 mr-1" />
                  {folder.links.length} lien{folder.links.length > 1 ? 's' : ''}
                </span>
                {folder.children && folder.children.length > 0 && (
                  <span className="text-xs text-gray-500 flex items-center">
                    <FolderIcon className="w-3 h-3 mr-1" />
                    {folder.children.length} dossier{folder.children.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
          {onCreateLink && (
            <motion.button
              onClick={onCreateLink}
              className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600 hover:text-green-700"
              title="Créer un lien dans ce dossier"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          )}
          <motion.button
            onClick={onCreateSubfolder}
            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600 hover:text-blue-700"
            title="Créer un sous-dossier"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FolderPlus className="w-4 h-4" />
          </motion.button>
          {(folder as any).teamShared ? (
            onUnshare && (
              <motion.button
                onClick={onUnshare}
                className="p-2 hover:bg-orange-100 rounded-lg transition-colors text-orange-600 hover:text-orange-700"
                title="Retirer du partage"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-4 h-4" />
              </motion.button>
            )
          ) : (
            onShare && (
              <motion.button
                onClick={onShare}
                className="p-2 hover:bg-indigo-100 rounded-lg transition-colors text-indigo-600 hover:text-indigo-700"
                title="Partager avec la team"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-4 h-4" />
              </motion.button>
            )
          )}
          <motion.button
            onClick={onEdit}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-700"
            title="Modifier le dossier"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Edit2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={onDelete}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 hover:text-red-700"
            title="Supprimer le dossier"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Contenu du dossier */}
      <AnimatePresence>
        {folder.isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-gray-100 bg-gradient-to-br from-gray-50/30 to-gray-100/20 backdrop-blur-sm"
          >
            <div className="p-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function SortableLink({ 
  link, 
  onToggle, 
  onEdit, 
  onDelete,
  onRemoveFromFolder 
}: {
  link: LinkType
  onToggle: (id: string, isActive: boolean) => void
  onEdit: (link: LinkType) => void
  onDelete: (id: string) => void
  onRemoveFromFolder?: (linkId: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: `link-${link.id}`,
    data: {
      type: 'link',
      link
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <LinkCard
        link={link}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        onRemoveFromFolder={onRemoveFromFolder}
        isDragging={isDragging}
        listeners={listeners}
        attributes={attributes}
      />
    </div>
  )
}

export default function DragDropDashboard({
  folders,
  unorganizedLinks,
  onFoldersChange,
  onLinksChange,
  onToggleLink,
  onEditLink,
  onDeleteLink,
  onMoveLink,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onToggleFolder,
  onShareFolder,
  onUnshareFolder,
  onCreateLinkInFolder,
}: DragDropDashboardProps) {
  const { refreshAll: refreshLinksContext } = useLinks()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [createInParent, setCreateInParent] = useState<string | null>(null)
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean
    folderId: string | null
    folderName: string
    position: { x: number; y: number }
  }>({
    visible: false,
    folderId: null,
    folderName: '',
    position: { x: 0, y: 0 }
  })

  const handleFolderMouseEnter = (event: React.MouseEvent, folderId: string, folderName: string) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltipState({
      visible: true,
      folderId,
      folderName,
      position: {
        x: rect.right,
        y: rect.top
      }
    })
  }

  const handleFolderMouseLeave = () => {
    setTooltipState({
      visible: false,
      folderId: null,
      folderName: '',
      position: { x: 0, y: 0 }
    })
  }

  const handleCreateFolder = async (parentId?: string) => {
    if (!newFolderName.trim()) {
      toast.error('Veuillez entrer un nom pour le dossier')
      return
    }

    console.log('🚀 [DragDropDashboard] Création dossier avec:', {
      name: newFolderName.trim(),
      parentId: parentId || createInParent || 'null',
      createInParent,
      parentId
    })

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName.trim(),
          color: '#3b82f6',
          icon: '📁',
          parentId: parentId || createInParent,
        })
      })
      
      console.log('📡 [DragDropDashboard] Réponse API:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers)
      })
      
      if (response.ok) {
        const newFolder = await response.json()

        // ⚡ Formater le dossier avec toutes les propriétés nécessaires
        const formattedFolder = {
          ...newFolder,
          isExpanded: false,
          links: newFolder.links || [],
          children: newFolder.children || []
        }

        // Toujours mettre à jour instantanément
        const updateFolderStructure = (folders: any[], newFolder: any): any[] => {
          if (!parentId && !createInParent) {
            // Dossier racine - ajouter avec animation
            return [...folders, newFolder]
          } else {
            // Sous-dossier - trouver le parent et y ajouter l'enfant
            const parentFolderId = parentId || createInParent
            return folders.map(folder => {
              if (folder.id === parentFolderId) {
                return {
                  ...folder,
                  children: [...(folder.children || []), newFolder]
                }
              }
              // Recherche récursive dans les sous-dossiers
              if (folder.children && folder.children.length > 0) {
                return {
                  ...folder,
                  children: updateFolderStructure(folder.children, newFolder)
                }
              }
              return folder
            })
          }
        }

        onFoldersChange(updateFolderStructure(folders, formattedFolder))
        refreshLinksContext()

        setNewFolderName('')
        setShowCreateForm(false)
        setCreateInParent(null)
        toast.success('Dossier créé avec succès')
      } else {
        const errorData = await response.json()
        console.error('❌ [DragDropDashboard] Erreur API:', errorData)
        toast.error(errorData.error || 'Erreur lors de la création du dossier')
      }
    } catch (error) {
      console.error('❌ [DragDropDashboard] Erreur catch:', error)
      toast.error('Erreur lors de la création du dossier')
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Réduire la distance pour un drag plus réactif
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    setOverId(over ? over.id as string : null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) {
      setActiveId(null)
      setOverId(null)
      return
    }

    const activeData = active.data.current
    const overData = over.data.current

    // Si on déplace un lien
    if (activeData?.type === 'link') {
      const link = activeData.link as LinkType

      // Si on le dépose sur un dossier
      if (overData?.type === 'folder') {
        const targetFolder = overData.folder as Folder
        
        // Mise à jour instantanée de l'UI
        if (link.folderId) {
          // Fonction récursive pour mettre à jour les dossiers imbriqués
          const updateFoldersRecursive = (folderList: Folder[]): Folder[] => {
            return folderList.map(f => {
              if (f.id === link.folderId) {
                // Ancien dossier - retirer le lien
                return {
                  ...f,
                  links: f.links.filter(l => l.id !== link.id),
                  children: f.children ? updateFoldersRecursive(f.children) : []
                }
              } else if (f.id === targetFolder.id) {
                // Nouveau dossier - ajouter le lien
                return {
                  ...f,
                  links: [...f.links, { ...link, folderId: targetFolder.id }],
                  children: f.children ? updateFoldersRecursive(f.children) : []
                }
              } else if (f.children && f.children.length > 0) {
                // Parcourir les enfants
                return {
                  ...f,
                  children: updateFoldersRecursive(f.children)
                }
              }
              return f
            })
          }
          
          onFoldersChange(updateFoldersRecursive(folders))
        } else {
          // Le lien vient de la zone non organisée
          const newUnorganizedLinks = unorganizedLinks.filter(l => l.id !== link.id)
          onLinksChange(newUnorganizedLinks)
          
          // Fonction récursive pour ajouter au dossier cible
          const addToTargetFolder = (folderList: Folder[]): Folder[] => {
            return folderList.map(f => {
              if (f.id === targetFolder.id) {
                return {
                  ...f,
                  links: [...f.links, { ...link, folderId: targetFolder.id }]
                }
              } else if (f.children && f.children.length > 0) {
                return {
                  ...f,
                  children: addToTargetFolder(f.children)
                }
              }
              return f
            })
          }
          
          onFoldersChange(addToTargetFolder(folders))
        }
        
        toast.success(`"${link.title}" déplacé dans "${targetFolder.name}"`)
        
        // Appel API en arrière-plan
        onMoveLink(link.id, targetFolder.id).catch(error => {
          toast.error('Erreur lors de la sauvegarde')
          refreshLinksContext() // Recharger en cas d'erreur
        })
      }
      // Si on le dépose dans la zone "sans dossier"
      else if (over.id === 'unorganized') {
        if (link.folderId) {
          // Mise à jour instantanée avec recherche récursive
          const removeLinkFromFolder = (folderList: Folder[]): Folder[] => {
            return folderList.map(f => {
              if (f.id === link.folderId) {
                return {
                  ...f,
                  links: f.links.filter(l => l.id !== link.id)
                }
              } else if (f.children && f.children.length > 0) {
                return {
                  ...f,
                  children: removeLinkFromFolder(f.children)
                }
              }
              return f
            })
          }
          
          onFoldersChange(removeLinkFromFolder(folders))
          onLinksChange([...unorganizedLinks, { ...link, folderId: null }])
          
          toast.success(`"${link.title}" retiré du dossier`)
          
          // Appel API en arrière-plan
          onMoveLink(link.id, null).catch(error => {
            toast.error('Erreur lors de la sauvegarde')
            refreshLinksContext()
          })
        }
      }
      // Si on le dépose sur un autre lien dans le même conteneur
      else if (overData?.type === 'link') {
        const overLink = overData.link as LinkType
        
        // Si les deux liens sont dans le même conteneur (même dossier ou sans dossier)
        if (link.folderId === overLink.folderId) {
          // Si c'est dans la section sans dossier
          if (!link.folderId) {
            const activeIndex = unorganizedLinks.findIndex(l => l.id === link.id)
            const overIndex = unorganizedLinks.findIndex(l => l.id === overLink.id)
            
            if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
              // Mise à jour instantanée
              const newLinks = arrayMove(unorganizedLinks, activeIndex, overIndex)
              onLinksChange(newLinks)
              
              // Persister l'ordre en arrière-plan
              const linkIds = newLinks.map(l => l.id)
              fetch('/api/links/order', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ linkIds })
              }).catch(error => {
                toast.error('Erreur lors de la sauvegarde de l\'ordre')
              })
            }
          }
          // Si c'est dans un dossier
          else {
            // Fonction récursive pour trouver et mettre à jour le dossier
            const updateFolderLinks = (folderList: Folder[]): Folder[] => {
              return folderList.map(f => {
                if (f.id === link.folderId) {
                  const activeIndex = f.links.findIndex(l => l.id === link.id)
                  const overIndex = f.links.findIndex(l => l.id === overLink.id)
                  
                  if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
                    const newFolderLinks = arrayMove(f.links, activeIndex, overIndex)
                    return { ...f, links: newFolderLinks }
                  }
                } else if (f.children && f.children.length > 0) {
                  return {
                    ...f,
                    children: updateFolderLinks(f.children)
                  }
                }
                return f
              })
            }
            
            // Fonction récursive pour obtenir les IDs des liens dans l'ordre
            const getLinkIds = (folderList: Folder[], targetFolderId: string): string[] => {
              for (const f of folderList) {
                if (f.id === targetFolderId) {
                  return f.links.map(l => l.id)
                } else if (f.children && f.children.length > 0) {
                  const result = getLinkIds(f.children, targetFolderId)
                  if (result.length > 0) return result
                }
              }
              return []
            }
            
            const updatedFolders = updateFolderLinks(folders)
            onFoldersChange(updatedFolders)
            
            // Persister l'ordre en arrière-plan
            const linkIds = getLinkIds(updatedFolders, link.folderId!)
            if (linkIds.length > 0) {
              fetch('/api/links/order', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ linkIds })
              }).catch(error => {
                toast.error('Erreur lors de la sauvegarde de l\'ordre')
              })
            }
          }
        }
      }
    }
    // Si on déplace un dossier sur un autre dossier
    else if (activeData?.type === 'folder' && overData?.type === 'folder') {
      const activeFolder = activeData.folder as Folder
      const overFolder = overData.folder as Folder
      
      if (activeFolder.id !== overFolder.id) {
        // Demander confirmation avant de déplacer un dossier dans un autre
        if (confirm(`Voulez-vous déplacer le dossier "${activeFolder.name}" dans "${overFolder.name}" ?`)) {
          try {
            const response = await fetch(`/api/folders/${activeFolder.id}/move`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ parentId: overFolder.id })
            })
            
            if (response.ok) {
              // Mise à jour instantanée de la structure
              const updateFolderMove = (folders: any[], movedId: string, newParentId: string): any[] => {
                let movedFolder: any = null
                
                // Trouver et retirer le dossier déplacé
                const removeFolderRecursive = (folderList: any[]): any[] => {
                  return folderList.reduce((acc, folder) => {
                    if (folder.id === movedId) {
                      movedFolder = { ...folder, parentId: newParentId }
                      return acc
                    }
                    
                    const updatedFolder = { ...folder }
                    if (folder.children && folder.children.length > 0) {
                      updatedFolder.children = removeFolderRecursive(folder.children)
                    }
                    return [...acc, updatedFolder]
                  }, [])
                }
                
                const foldersWithoutMoved = removeFolderRecursive(folders)
                
                // Ajouter le dossier à son nouveau parent
                const addToParent = (folderList: any[]): any[] => {
                  return folderList.map(folder => {
                    if (folder.id === newParentId) {
                      return {
                        ...folder,
                        children: [...(folder.children || []), movedFolder]
                      }
                    }
                    if (folder.children && folder.children.length > 0) {
                      return {
                        ...folder,
                        children: addToParent(folder.children)
                      }
                    }
                    return folder
                  })
                }
                
                return addToParent(foldersWithoutMoved)
              }
              
              onFoldersChange(updateFolderMove(folders, activeFolder.id, overFolder.id))
              refreshLinksContext()
              toast.success('Dossier déplacé avec succès')
            }
          } catch (error) {
            toast.error('Erreur lors du déplacement')
          }
        }
      }
    }

    setActiveId(null)
    setOverId(null)
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setOverId(null)
  }

  // Obtenir l'élément actif pour l'overlay
  let activeItem = null
  if (activeId) {
    if (activeId.startsWith('link-')) {
      const linkId = activeId.replace('link-', '')
      activeItem = unorganizedLinks.find(l => l.id === linkId) || 
                   folders.flatMap(f => f.links).find(l => l.id === linkId)
    } else if (activeId.startsWith('folder-')) {
      const folderId = activeId.replace('folder-', '')
      activeItem = folders.find(f => f.id === folderId)
    }
  }

  const dropAnimationConfig = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  }

  // Fonction récursive pour afficher les dossiers imbriqués
  const renderFolder = (folder: Folder, depth: number = 0): React.ReactNode => {
    return (
      <div key={folder.id} style={{ marginLeft: `${depth * 16}px` }}>
        <SortableFolder
          folder={folder}
          onEdit={() => onEditFolder(folder)}
          onDelete={() => onDeleteFolder(folder.id)}
          onToggle={() => onToggleFolder(folder.id)}
          onCreateSubfolder={() => {
            setCreateInParent(folder.id)
            setShowCreateForm(true)
          }}
          onCreateLink={onCreateLinkInFolder ? () => onCreateLinkInFolder(folder.id) : undefined}
          onShare={onShareFolder ? () => onShareFolder(folder.id, folder.name) : undefined}
          onUnshare={onUnshareFolder ? () => onUnshareFolder(folder.id, folder.name) : undefined}
          onMouseEnter={(event) => handleFolderMouseEnter(event, folder.id, folder.name)}
          onMouseLeave={handleFolderMouseLeave}
          isOver={overId === `folder-${folder.id}`}
          depth={depth}
        >
          <div className="space-y-2">
            {/* Liens du dossier */}
            {folder.links.length > 0 && (
              <SortableContext
                items={folder.links.map(l => `link-${l.id}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {folder.links.map((link) => (
                    <SortableLink
                      key={link.id}
                      link={link}
                      onToggle={onToggleLink}
                      onEdit={onEditLink}
                      onDelete={onDeleteLink}
                      onRemoveFromFolder={async (linkId) => {
                        await onMoveLink(linkId, null)
                        refreshLinksContext()
                        toast.success('Lien retiré du dossier')
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            )}
            
            {/* Sous-dossiers */}
            {folder.children && folder.children.length > 0 && (
              <div className="space-y-2 mt-2">
                {folder.children.map((childFolder) => renderFolder(childFolder, depth + 1))}
              </div>
            )}
            
            {/* Message si le dossier est vide */}
            {folder.links.length === 0 && (!folder.children || folder.children.length === 0) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="p-3 bg-gray-100 rounded-xl mb-3">
                  <FolderIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 font-medium">Dossier vide</p>
                <p className="text-xs text-gray-400 mt-1">Glissez des liens ou créez des sous-dossiers</p>
              </motion.div>
            )}
          </div>
        </SortableFolder>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Colonne des dossiers */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <FolderIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dossiers</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Organisez vos liens</p>
              </div>
            </div>
            <motion.button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-xl flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FolderPlus className="w-4 h-4" />
              <span className="font-medium">Nouveau</span>
            </motion.button>
          </div>

          {/* Formulaire de création de dossier */}
          <AnimatePresence>
            {showCreateForm && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FolderPlus className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Nouveau dossier</h3>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                      placeholder="Nom du dossier"
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                      autoFocus
                    />
                    <div className="flex space-x-2 sm:space-x-3">
                      <motion.button
                        onClick={() => handleCreateFolder()}
                        className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Créer
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          setShowCreateForm(false)
                          setNewFolderName('')
                          setCreateInParent(null)
                        }}
                        className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Annuler
                      </motion.button>
                    </div>
                  </div>
                  {createInParent && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <FolderIcon className="w-4 h-4 mr-1" />
                      Sera créé dans: <span className="font-medium ml-1">{folders.find(f => f.id === createInParent)?.name}</span>
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <SortableContext
            items={folders.map(f => `folder-${f.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence mode="popLayout">
              <div className="space-y-4">
                {folders.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-4">
                      <FolderIcon className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun dossier encore</h3>
                    <p className="text-gray-500 mb-4 max-w-xs">
                      Créez votre premier dossier pour organiser vos liens
                    </p>
                    <motion.button
                      onClick={() => setShowCreateForm(true)}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Créer mon premier dossier
                    </motion.button>
                  </motion.div>
                ) : (
                  folders.map((folder) => (
                    <motion.div
                      key={folder.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100, scale: 0.9 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      {renderFolder(folder, 0)}
                    </motion.div>
                  ))
                )}
              </div>
            </AnimatePresence>
          </SortableContext>
        </div>

        {/* Colonne des liens sans dossier */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Liens libres</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{unorganizedLinks.length} liens non organisés</p>
            </div>
          </div>

          <motion.div
            id="unorganized"
            data-type="droppable"
            className={`min-h-[300px] rounded-2xl transition-all duration-150 ${
              overId === 'unorganized' 
                ? 'border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg scale-[1.01]' 
                : 'border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50/50 to-gray-100/30'
            }`}
            animate={{
              borderColor: overId === 'unorganized' ? '#60a5fa' : '#d1d5db'
            }}
          >
            {unorganizedLinks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mb-4"
                >
                  <div className="p-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl">
                    <Link2 className="w-12 h-12 text-emerald-600" />
                  </div>
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Parfaitement organisé !</h3>
                <p className="text-gray-500">
                  Tous vos liens sont bien rangés dans des dossiers
                </p>
              </div>
            ) : (
              <div className="p-6">
                <SortableContext
                  items={unorganizedLinks.map(l => `link-${l.id}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {unorganizedLinks.map((link) => (
                      <SortableLink
                        key={link.id}
                        link={link}
                        onToggle={onToggleLink}
                        onEdit={onEditLink}
                        onDelete={onDeleteLink}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Overlay pendant le drag */}
      <DragOverlay dropAnimation={dropAnimationConfig}>
        {activeItem && activeId?.startsWith('link-') ? (
          <LinkCard
            link={activeItem as LinkType}
            onToggle={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
            isDragging
          />
        ) : null}
      </DragOverlay>

      {/* Tooltip d'analytics */}
      {tooltipState.folderId && (
        <FolderAnalyticsTooltip
          folderId={tooltipState.folderId}
          folderName={tooltipState.folderName}
          isVisible={tooltipState.visible}
          position={tooltipState.position}
        />
      )}
    </DndContext>
  )
}