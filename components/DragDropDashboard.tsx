'use client'

import { useState } from 'react'
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
  useDroppable,
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
  ChevronRight,
  Edit2,
  Trash2,
  Link2,
  FolderPlus,
  Share2,
  MousePointer,
  GripVertical
} from 'lucide-react'
import { toast } from 'react-hot-toast'
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
  onMoveLink: (linkId: string, folderId: string | null) => Promise<void>
  onCreateFolder: () => void
  onEditFolder: (folder: Folder) => void
  onDeleteFolder: (folderId: string) => void
  onToggleFolder: (folderId: string) => void
  onShareFolder?: (folderId: string, folderName: string) => void
  onUnshareFolder?: (folderId: string, folderName: string) => void
  onCreateLinkInFolder?: (folderId: string) => void
  onFolderCreated?: () => void
  folderClickCounts?: Record<string, number>
  periodLabel?: string
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
  clickCount,
  periodLabel,
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
  clickCount?: number
  periodLabel?: string
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
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-150 ${
        isDragging ? 'opacity-50 shadow-2xl' : ''
      } ${isOver ? 'border-violet-400 bg-violet-500/10 ring-2 ring-violet-400/30' : 'border-[#2a2a38] bg-[#11111a] hover:border-[#3a3a4a]'}`}
    >
      {/* En-tête du dossier */}
      <div
        className={`flex items-center justify-between gap-3 p-4 transition-all duration-100 ${
          isOver ? 'bg-violet-500/10' : 'hover:bg-white/[0.025]'
        }`}
        style={{
          background: isOver ? undefined : `linear-gradient(135deg, ${folder.color}08, ${folder.color}15)`,
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="flex items-center space-x-4 cursor-pointer flex-1" onClick={onToggle}>
          <motion.div
            animate={{ rotate: folder.isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronRight className="h-5 w-5 text-[#77778a]" />
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
              <h3 className="truncate font-semibold text-white">{folder.name}</h3>
              {folder.description && (
                <p className="truncate text-sm text-[#858598]">{folder.description}</p>
              )}
              <div className="flex items-center space-x-3 mt-1">
                <span className="flex items-center text-xs text-[#858598]">
                  <Link2 className="w-3 h-3 mr-1" />
                  {(() => {
                    // 🔥 FIX: Compter TOUS les liens (directs + dans sous-dossiers)
                    const directLinks = folder.links.length
                    const childrenLinks = folder.children?.reduce((sum, child) => sum + (child.links?.length || 0), 0) || 0
                    const totalLinks = directLinks + childrenLinks

                    if (directLinks > 0 && childrenLinks > 0) {
                      return `${totalLinks} links (${directLinks} here, ${childrenLinks} nested)`
                    }
                    return `${totalLinks} link${totalLinks !== 1 ? 's' : ''}`
                  })()}
                </span>
                <span className="flex items-center text-xs font-semibold text-violet-300">
                  <MousePointer className="w-3 h-3 mr-1" />
                  {(() => {
                    // 🔥 FIX: Compter TOUS les clics (directs + dans sous-dossiers)
                    const directClicks = folder.links.reduce((sum, link) => sum + (link.clicks || 0), 0)
                    const childrenClicks = folder.children?.reduce((sum, child) => {
                      return sum + (child.links?.reduce((linkSum, link) => linkSum + (link.clicks || 0), 0) || 0)
                    }, 0) || 0
                    const totalClicks = directClicks + childrenClicks

                    return (clickCount ?? totalClicks).toLocaleString()
                  })()} click{(() => {
                    const directClicks = folder.links.reduce((sum, link) => sum + (link.clicks || 0), 0)
                    const childrenClicks = folder.children?.reduce((sum, child) => {
                      return sum + (child.links?.reduce((linkSum, link) => linkSum + (link.clicks || 0), 0) || 0)
                    }, 0) || 0
                    return (clickCount ?? (directClicks + childrenClicks)) !== 1 ? 's' : ''
                  })()} {periodLabel ? `· ${periodLabel}` : ''}
                </span>
                {folder.children && folder.children.length > 0 && (
                  <span className="flex items-center text-xs text-[#858598]">
                    <FolderIcon className="w-3 h-3 mr-1" />
                    {folder.children.length} subfolder{folder.children.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {/* Drag Handle for Folders */}
          <div
            className="cursor-grab rounded-lg p-2 text-[#77778a] transition-colors hover:bg-white/5 hover:text-white active:cursor-grabbing"
            title="Drag folder"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </div>

          {onCreateLink && (
            <motion.button
              onClick={onCreateLink}
              className="flex items-center gap-1.5 rounded-lg bg-violet-500/10 px-2.5 py-2 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/20"
              title="Add a link to this folder"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Link</span>
            </motion.button>
          )}
          <motion.button
            onClick={onCreateSubfolder}
            className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-2 text-xs font-semibold text-[#c7c7d2] transition hover:bg-white/10 hover:text-white"
            title="Add a subfolder"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FolderPlus className="h-3.5 w-3.5" />
            <span>Subfolder</span>
          </motion.button>
          {(folder as any).teamShared ? (
            onUnshare && (
              <motion.button
                onClick={onUnshare}
                className="rounded-lg p-2 text-orange-300 transition hover:bg-orange-500/10"
                title="Stop sharing with the team"
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
                className="rounded-lg p-2 text-[#77778a] transition hover:bg-white/5 hover:text-white"
                title="Share with the team"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-4 h-4" />
              </motion.button>
            )
          )}
          <motion.button
            onClick={onEdit}
            className="rounded-lg p-2 text-[#77778a] transition hover:bg-white/5 hover:text-white"
            title="Edit folder"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Edit2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={onDelete}
            className="rounded-lg p-2 text-[#77778a] transition hover:bg-red-500/10 hover:text-red-300"
            title="Delete folder"
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
            className="border-t border-[#252532] bg-[#0b0b12]"
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
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : 'auto',
    borderTop: '1px solid transparent', // Prévient margin collapse
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-2 rounded-xl border border-[#292936] bg-[#151520] p-3 transition hover:border-[#3a3a4a] ${
        isDragging ? 'cursor-grabbing opacity-40' : ''
      }`}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          type="button"
          className="cursor-grab rounded-lg p-2 text-[#666679] hover:bg-white/5 hover:text-white active:cursor-grabbing"
          title="Drag this link"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-base">
          {link.icon || <Link2 className="h-4 w-4 text-violet-300" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#666679]">
            {link.internalName ? 'Internal name' : 'Link name'}
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-white">{link.internalName || link.title}</p>
          <p className="mt-0.5 truncate text-xs text-[#77778a]">/{link.slug}</p>
        </div>
        <button
          type="button"
          onClick={() => onEdit(link)}
          className="shrink-0 rounded-lg p-2 text-[#858598] hover:bg-white/5 hover:text-white"
          title="Edit link"
        >
          <Edit2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#292936] pt-3">
        <span className="rounded-lg bg-violet-500/10 px-2.5 py-1.5 text-xs font-semibold text-violet-300">
          {(link.clicks || 0).toLocaleString()} clicks
        </span>
        <button
          type="button"
          onClick={() => onToggle(link.id, !link.isActive)}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
            link.isActive
              ? 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
              : 'bg-white/5 text-[#858598] hover:bg-white/10'
          }`}
          title={link.isActive ? 'Click to pause this link' : 'Click to activate this link'}
        >
          {link.isActive ? 'Active' : 'Paused'}
        </button>
        <span className="flex-1" />
        {onRemoveFromFolder && (
          <button
            type="button"
            onClick={() => onRemoveFromFolder(link.id)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#858598] hover:bg-cyan-500/10 hover:text-cyan-300"
            title="Move back to Inbox"
          >
            <Link2 className="h-3.5 w-3.5" />
            Inbox
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            if (confirm(`Delete "${link.internalName || link.title}" permanently?`)) {
              onDelete(link.id)
            }
          }}
          className="rounded-lg p-2 text-[#858598] hover:bg-red-500/10 hover:text-red-300"
          title="Delete link"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
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
  onFolderCreated,
  folderClickCounts = {},
  periodLabel,
}: DragDropDashboardProps) {
  const { refreshAll: refreshLinksContext } = useLinks()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [createInParent, setCreateInParent] = useState<string | null>(null)
  const {
    setNodeRef: setUnorganizedRef,
    isOver: isUnorganizedOver,
  } = useDroppable({
    id: 'unorganized',
    data: { type: 'unorganized' },
  })
  const handleCreateFolder = async (parentId?: string) => {
    if (!newFolderName.trim()) {
      toast.error('Enter a folder name.')
      return
    }

    console.log('🚀 [DragDropDashboard] Création dossier avec:', {
      name: newFolderName.trim(),
      parentId: parentId || createInParent || 'null',
      createInParent
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

        // ⚡ Invalider TOUS les caches localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('dashboard-stats')
          localStorage.removeItem('folder-stats')
          localStorage.removeItem('folders-page-cache')  // 🔥 FIX: Invalider aussi le cache de la page folders
        }

        setNewFolderName('')
        setShowCreateForm(false)
        setCreateInParent(null)
        toast.success('Folder created successfully.')

        // ⚡ Appeler le callback pour recharger les données
        onFolderCreated?.()

      } else {
        const errorData = await response.json()
        console.error('❌ [DragDropDashboard] Erreur API:', errorData)
        toast.error(errorData.error || 'Unable to create the folder.')
      }
    } catch (error) {
      console.error('❌ [DragDropDashboard] Erreur catch:', error)
      toast.error('Unable to create the folder.')
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Réduit pour un drag plus fluide et réactif
        delay: 0,
        tolerance: 5,
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
        
        toast.success(`"${link.internalName || link.title}" moved to "${targetFolder.name}"`)
        
        // Appel API en arrière-plan
        onMoveLink(link.id, targetFolder.id).catch(error => {
          toast.error('Unable to save changes.')
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
          
          toast.success(`"${link.internalName || link.title}" removed from the folder`)
          
          // Appel API en arrière-plan
          onMoveLink(link.id, null).catch(error => {
            toast.error('Unable to save changes.')
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
                toast.error('Unable to save the order.')
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
                toast.error('Unable to save the order.')
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
        if (confirm(`Move the folder "${activeFolder.name}" into "${overFolder.name}"?`)) {
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
              toast.success('Folder moved successfully.')
            }
          } catch (error) {
            toast.error('Unable to move the folder.')
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

  // Obtenir l'élément actif pour l'overlay (récursif pour sous-dossiers)
  let activeItem = null
  if (activeId) {
    if (activeId.startsWith('link-')) {
      const linkId = activeId.replace('link-', '')
      // Chercher dans les liens non organisés
      activeItem = unorganizedLinks.find(l => l.id === linkId)

      // Si pas trouvé, chercher récursivement dans tous les dossiers
      if (!activeItem) {
        const findLinkRecursive = (folders: Folder[]): LinkType | undefined => {
          for (const folder of folders) {
            const found = folder.links.find(l => l.id === linkId)
            if (found) return found

            if (folder.children && folder.children.length > 0) {
              const foundInChild = findLinkRecursive(folder.children)
              if (foundInChild) return foundInChild
            }
          }
          return undefined
        }
        activeItem = findLinkRecursive(folders)
      }
    } else if (activeId.startsWith('folder-')) {
      const folderId = activeId.replace('folder-', '')
      const findFolderRecursive = (folderList: Folder[]): Folder | undefined => {
        for (const folder of folderList) {
          if (folder.id === folderId) return folder
          const child = folder.children?.length ? findFolderRecursive(folder.children) : undefined
          if (child) return child
        }
        return undefined
      }
      activeItem = findFolderRecursive(folders)
    }
  }

  const dropAnimationConfig = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.4',
          height: 'auto',
          minHeight: 'auto',
        },
      },
    }),
    duration: 200,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // Plus naturel, moins "bouncy"
  }

  // Fonction récursive pour afficher les dossiers imbriqués
  const renderFolder = (folder: Folder, depth: number = 0): React.ReactNode => {
    return (
      <div key={folder.id}>
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
          isOver={overId === `folder-${folder.id}`}
          clickCount={folderClickCounts[folder.id]}
          periodLabel={periodLabel}
          depth={depth}
        >
          <div className="space-y-2">
            {/* Liens du dossier */}
            {folder.links.length > 0 && (
              <SortableContext
                items={folder.links.map(l => `link-${l.id}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col">
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
                        toast.success('Link removed from the folder.')
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
                <div className="mb-3 rounded-xl bg-white/5 p-3">
                  <FolderIcon className="h-7 w-7 text-[#77778a]" />
                </div>
                <p className="text-sm font-medium text-[#b0b0bf]">This folder is empty</p>
                <p className="mt-1 text-xs text-[#6f6f81]">Drop a link here, or add a subfolder.</p>
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
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <section className="space-y-5 rounded-3xl border border-[#252532] bg-[#0b0b12] p-4 sm:p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-violet-500/15 p-2.5">
                <FolderIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Your folders</h2>
                <p className="text-sm text-[#858598]">Open a folder to see its links and subfolders.</p>
              </div>
            </div>
            <motion.button
              onClick={() => setShowCreateForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-violet-500/15 transition hover:bg-violet-400 sm:w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FolderPlus className="w-4 h-4" />
              <span className="font-medium">New folder</span>
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
                className="rounded-2xl border border-violet-500/30 bg-[#151520] p-5 shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="rounded-lg bg-violet-500/15 p-2">
                      <FolderPlus className="h-5 w-5 text-violet-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {createInParent ? 'New subfolder' : 'New folder'}
                    </h3>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                      placeholder={createInParent ? 'Subfolder name (niche, platform, campaign...)' : 'Folder name'}
                      className="flex-1 rounded-xl border border-[#343444] bg-[#0b0b12] px-4 py-3 text-sm text-white outline-none placeholder:text-[#686879] focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                      autoFocus
                    />
                    <div className="flex space-x-2 sm:space-x-3">
                      <motion.button
                        onClick={() => handleCreateFolder()}
                        className="flex-1 rounded-xl bg-violet-500 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-400 sm:flex-none"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Create
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          setShowCreateForm(false)
                          setNewFolderName('')
                          setCreateInParent(null)
                        }}
                        className="flex-1 rounded-xl border border-[#343444] px-6 py-3 text-sm font-semibold text-[#b0b0bf] hover:bg-white/5 hover:text-white sm:flex-none"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                  {createInParent && (
                    <p className="flex items-center text-sm text-[#858598]">
                      <FolderIcon className="w-4 h-4 mr-1" />
                      Will be created in: <span className="font-medium ml-1">{folders.find(f => f.id === createInParent)?.name}</span>
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
            <div className="space-y-4">
              {folders.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#343444] py-12 text-center">
                  <div className="mb-4 rounded-2xl bg-violet-500/10 p-4">
                    <FolderIcon className="h-10 w-10 text-violet-300" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">Create your first folder</h3>
                  <p className="mb-4 max-w-xs text-sm text-[#858598]">
                    Name it after a niche, platform, campaign, or anything useful to you.
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="rounded-xl bg-violet-500 px-6 py-3 font-semibold text-white transition hover:bg-violet-400"
                  >
                    Create folder
                  </button>
                </div>
              ) : (
                folders.map((folder) => (
                  <div key={folder.id}>
                    {renderFolder(folder, 0)}
                  </div>
                ))
              )}
            </div>
          </SortableContext>
        </section>

        <aside className="space-y-5 rounded-3xl border border-[#252532] bg-[#0b0b12] p-4 sm:p-5">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-cyan-500/10 p-2.5">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Inbox</h2>
              <p className="text-sm text-[#858598]">
                {unorganizedLinks.length
                  ? `${unorganizedLinks.length} link${unorganizedLinks.length !== 1 ? 's' : ''} waiting to be filed`
                  : 'No links waiting to be filed'}
              </p>
            </div>
          </div>

          <motion.div
            ref={setUnorganizedRef}
            id="unorganized"
            data-type="droppable"
            className={`min-h-[300px] rounded-2xl transition-all duration-150 ${
              isUnorganizedOver || overId === 'unorganized'
                ? 'border-2 border-violet-400 bg-violet-500/10 shadow-lg shadow-violet-500/10'
                : 'border-2 border-dashed border-[#343444] bg-[#11111a]'
            }`}
            animate={{
              borderColor: isUnorganizedOver || overId === 'unorganized' ? '#a78bfa' : '#343444'
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
                  <div className="rounded-2xl bg-emerald-500/10 p-4">
                    <Link2 className="h-10 w-10 text-emerald-300" />
                  </div>
                </motion.div>
                <h3 className="mb-2 text-lg font-semibold text-white">Inbox cleared</h3>
                <p className="max-w-xs text-sm text-[#858598]">
                  New links without a folder will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="p-6">
                <SortableContext
                  items={unorganizedLinks.map(l => `link-${l.id}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col">
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
        </aside>
      </div>

      {/* Overlay pendant le drag */}
      <DragOverlay dropAnimation={dropAnimationConfig}>
        {activeItem && activeId?.startsWith('link-') ? (
          <div className="flex min-w-[320px] cursor-grabbing items-center gap-3 rounded-xl border border-violet-400 bg-[#151520] p-3 shadow-2xl shadow-violet-500/20">
            <GripVertical className="h-4 w-4 text-violet-300" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {(activeItem as LinkType).internalName || (activeItem as LinkType).title}
              </p>
              <p className="truncate text-xs text-[#858598]">/{(activeItem as LinkType).slug}</p>
            </div>
          </div>
        ) : null}
      </DragOverlay>

    </DndContext>
  )
}
