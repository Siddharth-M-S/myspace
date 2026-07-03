import { auth } from '@/lib/auth'
import { getEntryById, updateEntry, deleteEntry } from '@/lib/entries'
import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const entry = await getEntryById(params.id)
  if (!entry || entry.userId !== session.user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ entry })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const entry = await getEntryById(params.id)
  if (!entry || entry.userId !== session.user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const updates = await req.json()
  const updated = await updateEntry(params.id, updates)
  return NextResponse.json({ entry: updated })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const entry = await getEntryById(params.id)
  if (!entry || entry.userId !== session.user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await deleteEntry(params.id)
  return NextResponse.json({ ok: true })
}
