import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getEntryById } from '@/lib/entries'
import { getSectionsForUser } from '@/lib/sections'
import { EntryEditorWrapper } from '@/components/entry/EntryEditorWrapper'

export default async function EditEntryPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) redirect('/login')

  const [entry, sections] = await Promise.all([
    getEntryById(params.id),
    getSectionsForUser(session.user.id),
  ])

  if (!entry || entry.userId !== session.user.id) redirect('/')

  return (
    <div>
      <div className="border-b border-white/10 px-6 py-4">
        <h1 className="text-lg font-semibold text-white">Edit Entry</h1>
      </div>
      <EntryEditorWrapper
        sections={sections}
        initialData={{
          id: entry.id,
          title: entry.title,
          content: entry.content,
          tags: entry.tags,
          source: entry.source,
          sectionId: entry.sectionId,
        }}
      />
    </div>
  )
}
