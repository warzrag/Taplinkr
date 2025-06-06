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
  Link2
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import LinkCard from './LinkCard'
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
}

function SortableFolder({ 
  folder, 
  children, 
  onEdit, 
  onDelete, 
  onToggle,
  isOver 
}: {
  folder: Folder
  children: React.ReactNode
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
  isOver?: boolean
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
      style={style}
      className={`border rounded-lg overflow-hidden transition-all ${
        isDragging ? 'opacity-50' : ''
      } ${isOver ? 'ring-2 ring-blue-500 bg-blue-50/50' : 'border-gray-200'}`}
      layout
    >
      {/* En-tête du dossier */}
      <div 
        className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 ${
          isOver ? 'bg-blue-50' : ''
        }`}
        style={{ backgroundColor: isOver ? undefined : `${folder.color}10` }}
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center space-x-3" onClick={onToggle}>
          {folder.isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <span className="text-lg select-none">{folder.icon}</span>
          <div className="select-none">
            <h3 className="font-semibold">{folder.name}</h3>
            {folder.description && (
              <p className="text-sm text-gray-600">{folder.description}</p>
            )}
            <p className="text-xs text-gray-500">{folder.links.length} lien(s)</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onEdit}
            className="p-1 hover:bg-white/50 rounded transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:bg-red-100 rounded transition-colors text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contenu du dossier */}
      <AnimatePresence>
        {folder.isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 p-3 bg-gray-50/50"
          >
            {children}
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
  onDelete 
}: {
  link: LinkType
  onToggle: (id: string, isActive: boolean) => void
  onEdit: (link: LinkType) => void
  onDelete: (id: string) => void
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
}: DragDropDashboardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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
        await onMoveLink(link.id, targetFolder.id)
        toast.success(`"${link.title}" déplacé dans "${targetFolder.name}"`)
      }
      // Si on le dépose dans la zone "sans dossier"
      else if (over.id === 'unorganized') {
        if (link.folderId) {
          await onMoveLink(link.id, null)
          toast.success(`"${link.title}" retiré du dossier`)
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
              const newLinks = arrayMove(unorganizedLinks, activeIndex, overIndex)
              onLinksChange(newLinks)
              
              // Persister l'ordre en base de données
              try {
                const linkIds = newLinks.map(l => l.id)
                await fetch('/api/links/order', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ linkIds })
                })
              } catch (error) {
                toast.error('Erreur lors de la sauvegarde de l\'ordre')
              }
            }
          }
          // Si c'est dans un dossier
          else {
            const folder = folders.find(f => f.id === link.folderId)
            if (folder) {
              const activeIndex = folder.links.findIndex(l => l.id === link.id)
              const overIndex = folder.links.findIndex(l => l.id === overLink.id)
              
              if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
                const newFolderLinks = arrayMove(folder.links, activeIndex, overIndex)
                const updatedFolder = { ...folder, links: newFolderLinks }
                const newFolders = folders.map(f => f.id === folder.id ? updatedFolder : f)
                onFoldersChange(newFolders)
                
                // Persister l'ordre en base de données
                try {
                  const linkIds = newFolderLinks.map(l => l.id)
                  await fetch('/api/links/order', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ linkIds })
                  })
                } catch (error) {
                  toast.error('Erreur lors de la sauvegarde de l\'ordre')
                }
              }
            }
          }
        }
      }
    }
    // Si on déplace un dossier
    else if (activeData?.type === 'folder' && overData?.type === 'folder') {
      const activeFolder = activeData.folder as Folder
      const overFolder = overData.folder as Folder
      
      if (activeFolder.id !== overFolder.id) {
        const activeIndex = folders.findIndex(f => f.id === activeFolder.id)
        const overIndex = folders.findIndex(f => f.id === overFolder.id)
        
        if (activeIndex !== -1 && overIndex !== -1) {
          const newFolders = arrayMove(folders, activeIndex, overIndex)
          onFoldersChange(newFolders)
          
          // Persister l'ordre en base de données
          try {
            const folderIds = newFolders.map(f => f.id)
            await fetch('/api/folders/order', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ folderIds })
            })
            toast.success('Ordre des dossiers mis à jour')
          } catch (error) {
            toast.error('Erreur lors de la sauvegarde de l\'ordre')
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne des dossiers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <FolderIcon className="w-5 h-5" />
              <span>Dossiers</span>
            </h2>
            <button
              onClick={onCreateFolder}
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau</span>
            </button>
          </div>

          <SortableContext
            items={folders.map(f => `folder-${f.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {folders.map((folder) => (
                <SortableFolder
                  key={folder.id}
                  folder={folder}
                  onEdit={() => onEditFolder(folder)}
                  onDelete={() => onDeleteFolder(folder.id)}
                  onToggle={() => onToggleFolder(folder.id)}
                  isOver={overId === `folder-${folder.id}`}
                >
                  {folder.links.length === 0 ? (
                    <p className="text-sm text-gray-500 italic text-center py-4">
                      Glissez des liens ici
                    </p>
                  ) : (
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
                          />
                        ))}
                      </div>
                    </SortableContext>
                  )}
                </SortableFolder>
              ))}
            </div>
          </SortableContext>
        </div>

        {/* Colonne des liens sans dossier */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <Link2 className="w-5 h-5" />
              <span>Liens sans dossier</span>
            </h2>
          </div>

          <div
            id="unorganized"
            className={`min-h-[200px] p-4 border-2 border-dashed rounded-lg transition-colors ${
              overId === 'unorganized' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
          >
            {unorganizedLinks.length === 0 ? (
              <p className="text-center text-gray-500 italic">
                Tous vos liens sont organisés !
              </p>
            ) : (
              <SortableContext
                items={unorganizedLinks.map(l => `link-${l.id}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
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
            )}
          </div>
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
    </DndContext>
  )
}