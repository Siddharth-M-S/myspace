import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getRecentEntries } from '@/lib/entries'
import { getSectionsForUser } from '@/lib/sections'
import { EntryCard } from '@/components/entry/EntryCard'
import { GlassCard } from '@/components/ui/GlassCard'
import Link from 'next/link'
import { Plus, BookOpen } from 'lucide-react'

export default async function HomePage() {
  const session = await auth()
  if (!session) redirect('/login')

  const [recentEntries, sections] = await Promise.all([
    getRecentEntries(session.user.id, 12),
    getSectionsForUser(session.user.id),
  ])

  const sectionMap = Object.fromEntries(sections.map((s) => [s.id, s.name]))

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, <span className="text-violet-400">{session.user.username}</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">Your personal knowledge base</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {sections.filter((s) => !s.isVault).map((section) => (
          <Link key={section.id} href={`/section/${section.id}`}>
            <GlassCard hover className="p-4 text-center">
              <p className="text-2xl font-bold text-violet-400">—</p>
              <p className="text-xs text-gray-400 mt-1">{section.name}</p>
            </GlassCard>
          </Link>
        ))}
      </div>

      {/* Recent entries */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-violet-400" />
          Recent Entries
        </h2>
        <Link
          href="/entry/new"
          className="flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Entry
        </Link>
      </div>

      {recentEntries.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <p className="text-gray-500 text-sm mb-4">No entries yet. Start capturing your knowledge!</p>
          <Link
            href="/entry/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create your first entry
          </Link>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentEntries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} sectionName={sectionMap[entry.sectionId]} />
          ))}
        </div>
      )}
    </div>
  )
}
