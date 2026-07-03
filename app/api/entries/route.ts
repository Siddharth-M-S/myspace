import { auth } from '@/lib/auth'
import { getEntriesForSection, createEntry, getRecentEntries } from '@/lib/entries'
import { getSectionById } from '@/lib/sections'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const url = new URL(req.url)
  const sectionId = url.searchParams.get('sectionId')
  const recent = url.searchParams.get('recent')

  if (recent) {
    const entries = await getRecentEntries(session.user.id)
    return NextResponse.json({ entries })
  }
  if (sectionId) {
    const entries = await getEntriesForSection(sectionId)
    return NextResponse.json({ entries })
  }
  return NextResponse.json({ entries: [] })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, content, tags, source, sectionId } = await req.json()
  if (!sectionId) return NextResponse.json({ error: 'sectionId required' }, { status: 400 })

  const section = await getSectionById(sectionId)
  if (!section || section.userId !== session.user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const entry = await createEntry({
    title: title || '',
    content: content || '',
    tags: tags || [],
    source: source || '',
    sectionId,
    userId: session.user.id,
    isVault: section.isVault,
  })

  return NextResponse.json({ entry })
}
