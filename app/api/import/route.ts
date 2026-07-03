import { auth } from '@/lib/auth'
import { createEntry } from '@/lib/entries'
import { getSectionsForUser } from '@/lib/sections'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const sectionId = formData.get('sectionId') as string

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  // Verify section belongs to user
  const sections = await getSectionsForUser(session.user.id)
  const section = sections.find((s) => s.id === sectionId)
  if (!section) return NextResponse.json({ error: 'Section not found' }, { status: 404 })

  const content = await file.text()
  const title = file.name.replace(/\.md$/i, '').replace(/-/g, ' ').replace(/_/g, ' ')

  const entry = await createEntry({
    title,
    content,
    tags: ['imported'],
    source: 'imported file',
    sectionId,
    userId: session.user.id,
    isVault: section.isVault,
  })

  return NextResponse.json({ entry })
}
