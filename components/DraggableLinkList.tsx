'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Link as LinkType } from '@/types'
import LinkCard from './LinkCard'
import { toast } from 'react-hot-toast'

interface SortableLinkProps {
  link: LinkType
  onToggle: (id: string, isActive: boolean) => void
  onEdit: (link: LinkType) => void
  onDelete: (id: string) => void
  onMoveToFolder?: (link: LinkType) => void
}

function SortableLink({ link, onToggle, onEdit, onDelete, onMoveToFolder }: SortableLinkProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id })

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
        onMoveToFolder={onMoveToFolder}
        isDragging={isDragging}
        listeners={listeners}
        attributes={attributes}
      />
    </div>
  )
}

interface DraggableLinkListProps {
  links: LinkType[]
  onLinksReorder: (newLinks: LinkType[]) => void
  onToggle: (id: string, isActive: boolean) => void
  onEdit: (link: LinkType) => void
  onDelete: (id: string) => void
  onMoveToFolder?: (link: LinkType) => void
}

export default function DraggableLinkList({
  links,
  onLinksReorder,
  onToggle,
  onEdit,
  onDelete,
  onMoveToFolder,
}: DraggableLinkListProps) {
  const [isReordering, setIsReordering] = useState(false)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex(link => link.id === active.id)
      const newIndex = links.findIndex(link => link.id === over.id)
      
      const reorderedLinks = arrayMove(links, oldIndex, newIndex)
      onLinksReorder(reorderedLinks)
      
      // Update order on server
      setIsReordering(true)
      try {
        const linkIds = reorderedLinks.map(link => link.id)
        const response = await fetch('/api/links/order', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ linkIds })
        })

        if (!response.ok) {
          throw new Error('Failed to update order')
        }
        
        toast.success('Ordre mis à jour')
      } catch (error) {
        toast.error('Erreur lors de la mise à jour de l\'ordre')
        // Revert the change on error
        onLinksReorder(links)
      } finally {
        setIsReordering(false)
      }
    }
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">🔗</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun lien encore</h3>
        <p className="text-gray-500 mb-4">Créez votre premier lien personnalisé pour commencer.</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${isReordering ? 'opacity-75' : ''}`}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={links.map(link => link.id)} strategy={verticalListSortingStrategy}>
          {links.map((link) => (
            <SortableLink
              key={link.id}
              link={link}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onMoveToFolder={onMoveToFolder}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}