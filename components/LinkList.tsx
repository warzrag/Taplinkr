"use client";

import { useState } from "react";
import { LinkCard } from "./LinkCard";
import type { LinkWithDetails } from "@/types";

interface LinkListProps {
  links: LinkWithDetails[];
  onLinkDeleted: (linkId: string) => void;
  onCustomize?: (link: LinkWithDetails) => void;
}

export function LinkList({ links, onLinkDeleted, onCustomize }: LinkListProps) {
  // Ensure links is an array to prevent map errors
  const safeLinks = Array.isArray(links) ? links : [];

  if (safeLinks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucun lien créé pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {safeLinks.map((link) => (
        <LinkCard
          key={link.id}
          link={link}
          onDelete={onLinkDeleted}
          onCustomize={onCustomize}
        />
      ))}
    </div>
  );
}
