import { getShareLink, verifySharePassword } from '@/lib/share'
import { getEntryById } from '@/lib/entries'
import { NextResponse } from 'next/server'

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const { password } = await req.json()
  const valid = await verifySharePassword(params.token, password)
  if (!valid) return NextResponse.json({ error: 'Invalid password or expired link' }, { status: 401 })

  const link = await getShareLink(params.token)
  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const entry = await getEntryById(link.entryId)
  if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 })

  return NextResponse.json({
    entry: {
      title: entry.title,
      content: entry.content,
      createdAt: entry.createdAt,
      tags: entry.tags,
    }
  })
}
