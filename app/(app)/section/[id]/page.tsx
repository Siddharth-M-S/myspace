import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSectionById } from '@/lib/sections'
import { getEntriesForSection } from '@/lib/entries'
import { EntryCard } from '@/components/entry/EntryCard'
import { FileEntryCard } from '@/components/entry/FileEntryCard'
import { GlassCard } from '@/components/ui/GlassCard'
import Link from 'next/link'
import { Plus, ChevronLeft, Upload } from 'lucide-react'

export default async function SectionPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) redirect('/login')

  const section = await getSectionById(params.id)
  if (!section || section.userId !== session.user.id) redirect('/')

  const entries = await getEntriesForSection(params.id)
  const noteEntries = entries.filter((e) => e.type !== 'file')
  const fileEntries = entries.filter((e) => e.type === 'file')

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link href="/" className="text-gray-500 hover:text-gray-300 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{section.name}</h1>
          <p className="text-sm text-gray-400">
            {noteEntries.length} note{noteEntries.length !== 1 ? 's' : ''}
            {fileEntries.length > 0 && ` · ${fileEntries.length} file${fileEntries.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/upload?section=${params.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload File</span>
          </Link>
          <Link
            href={`/entry/new?section=${params.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Note</span>
          </Link>
        </div>
      </div>

      {entries.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <p className="text-gray-500 text-sm mb-6">Nothing in {section.name} yet.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href={`/entry/new?section=${params.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Write a note
            </Link>
            <Link
              href={`/upload?section=${params.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload a file
            </Link>
          </div>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Files section */}
          {fileEntries.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Files ({fileEntries.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {fileEntries.map((entry) => (
                  <FileEntryCard key={entry.id} entry={entry} sectionName={section.name} />
                ))}
              </div>
            </div>
          )}

          {/* Notes section */}
          {noteEntries.length > 0 && (
            <div>
              {fileEntries.length > 0 && (
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Notes ({noteEntries.length})
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {noteEntries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} sectionName={section.name} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
