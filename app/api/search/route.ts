import { auth } from '@/lib/auth'
import { getAllEntriesForUser } from '@/lib/entries'
import { getSectionById } from '@/lib/sections'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const q = url.searchParams.get('q')?.toLowerCase() || ''
  const includeVault = url.searchParams.get('vault') === 'true'

  if (!q) return NextResponse.json({ results: [] })

  const entries = await getAllEntriesForUser(session.user.id)

  const results = []
  for (const entry of entries) {
    if (entry.isVault && !includeVault) continue

    const titleMatch = entry.title.toLowerCase().includes(q)
    const contentMatch = entry.content.toLowerCase().includes(q)
    const tagMatch = entry.tags?.some((t) => t.toLowerCase().includes(q))

    if (titleMatch || contentMatch || tagMatch) {
      const section = await getSectionById(entry.sectionId)
      // excerpt around the match
      const idx = entry.content.toLowerCase().indexOf(q)
      const start = Math.max(0, idx - 40)
      const excerptText = entry.content.slice(start, start + 120).replace(/\n/g, ' ')

      results.push({
        id: entry.id,
        title: entry.title,
        excerpt: excerptText,
        sectionName: section?.name || 'Unknown',
        createdAt: entry.createdAt,
        isVault: entry.isVault,
      })
    }
  }

  return NextResponse.json({ results: results.slice(0, 20) })
}
