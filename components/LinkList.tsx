'use client'

import { useState } from 'react'
import { LinkCard } from './LinkCard'

interface Link {
  id: string
  title: string
  url: string
  shortCode: string
  clicks: number
  createdAt: string
  _count?: {
    clicks_details: number
  }
}

interface LinkListProps {
  links: Link[]
  onLinkDeleted: (linkId: string) => void
  onCustomize?: (link: Link) => void
}

export function LinkList({ links, onLinkDeleted, onCustomize }: LinkListProps) {
  if (links.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucun lien créé pour le moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {links.map((link) => (
        <LinkCard
          key={link.id}
          link={link}
          onDelete={onLinkDeleted}
          onCustomize={onCustomize}
        />
      ))}
    </div>
  )
}