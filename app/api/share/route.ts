import { auth } from '@/lib/auth'
import { getEntryById } from '@/lib/entries'
import { createShareLink } from '@/lib/share'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { entryId, password } = await req.json()
  if (!entryId || !password) return NextResponse.json({ error: 'entryId and password required' }, { status: 400 })

  const entry = await getEntryById(entryId)
  if (!entry || entry.userId !== session.user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (entry.isVault) return NextResponse.json({ error: 'Cannot share vault entries' }, { status: 400 })

  const link = await createShareLink(entryId, password)
  return NextResponse.json({ token: link.token })
}
