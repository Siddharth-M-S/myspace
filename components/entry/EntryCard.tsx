'use client'

import Link from 'next/link'
import { formatRelative } from '@/lib/utils'
import { Tag, ExternalLink } from 'lucide-react'
import type { Entry } from '@/types'
import { GlassCard } from '@/components/ui/GlassCard'

interface EntryCardProps {
  entry: Entry
  sectionName?: string
}

export function EntryCard({ entry, sectionName }: EntryCardProps) {
  // quick plain text preview
  const preview = entry.content
    .replace(/```[\s\S]*?```/g, '[code]')
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 140)

  return (
    <Link href={`/entry/${entry.id}`}>
      <GlassCard hover className="p-4 cursor-pointer">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-white text-sm leading-tight line-clamp-1">{entry.title}</h3>
          <ExternalLink className="w-3.5 h-3.5 text-gray-600 shrink-0 mt-0.5" />
        </div>

        {preview && (
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-3">{preview}</p>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {entry.tags?.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-violet-600/20 text-violet-300 border border-violet-500/20"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
          <div className="text-right shrink-0">
            {sectionName && <p className="text-xs text-violet-400/70">{sectionName}</p>}
            <p className="text-xs text-gray-600">{formatRelative(entry.createdAt)}</p>
          </div>
        </div>
      </GlassCard>
    </Link>
  )
}
