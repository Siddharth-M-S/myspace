import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSectionsForUser } from '@/lib/sections'
import { EntryEditorWrapper } from '@/components/entry/EntryEditorWrapper'

export default async function NewEntryPage({
  searchParams,
}: {
  searchParams: { section?: string }
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const sections = await getSectionsForUser(session.user.id)

  return (
    <div>
      <div className="border-b border-white/10 px-6 py-4">
        <h1 className="text-lg font-semibold text-white">New Entry</h1>
      </div>
      <EntryEditorWrapper
        sections={sections}
        initialSectionId={searchParams.section}
      />
    </div>
  )
}
