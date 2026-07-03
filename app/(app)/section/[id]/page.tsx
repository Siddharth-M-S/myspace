import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSectionById } from '@/lib/sections'
import { getEntriesForSection } from '@/lib/entries'
import { EntryCard } from '@/components/entry/EntryCard'
import { GlassCard } from '@/components/ui/GlassCard'
import Link from 'next/link'
import { Plus, ChevronLeft } from 'lucide-react'

export default async function SectionPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) redirect('/login')

  const section = await getSectionById(params.id)
  if (!section || section.userId !== session.user.id) redirect('/')

  const entries = await getEntriesForSection(params.id)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-gray-500 hover:text-gray-300 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{section.name}</h1>
          <p className="text-sm text-gray-400">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</p>
        </div>
        <Link
          href={`/entry/new?section=${params.id}`}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Entry
        </Link>
      </div>

      {entries.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <p className="text-gray-500 text-sm mb-4">No entries in {section.name} yet.</p>
          <Link
            href={`/entry/new?section=${params.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add first entry
          </Link>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} sectionName={section.name} />
          ))}
        </div>
      )}
    </div>
  )
}
