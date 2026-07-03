import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getEntryById } from '@/lib/entries'
import { getSectionById } from '@/lib/sections'
import { EntryViewer } from '@/components/entry/EntryViewer'
import { DeleteEntryButton } from '@/components/entry/DeleteEntryButton'
import Link from 'next/link'
import { ChevronLeft, Pencil, Tag, Clock, FolderOpen, Share2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function EntryPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) redirect('/login')

  const entry = await getEntryById(params.id)
  if (!entry || entry.userId !== session.user.id) redirect('/')

  const section = await getSectionById(entry.sectionId)

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back + actions */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={section ? `/section/${section.id}` : '/'}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1" />
        {!entry.isVault && (
          <Link
            href={`/entry/${params.id}/share`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Link>
        )}
        <Link
          href={`/entry/${params.id}/edit`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-violet-400 hover:text-violet-300 hover:bg-violet-600/10 transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </Link>
        <DeleteEntryButton entryId={params.id} sectionId={entry.sectionId} />
      </div>

      {/* Entry header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-3 leading-tight">{entry.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {formatDate(entry.createdAt)}
          </span>
          {section && (
            <span className="flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4" />
              {section.name}
            </span>
          )}
          {entry.source && (
            <span className="text-violet-400/70 text-xs">{entry.source}</span>
          )}
        </div>
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-violet-600/20 text-violet-300 border border-violet-500/20"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 mb-6" />

      {/* Content */}
      <EntryViewer content={entry.content} />
    </div>
  )
}
