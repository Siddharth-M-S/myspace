import { auth } from '@/lib/auth'
import { getSectionById, updateSection, deleteSection } from '@/lib/sections'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const section = await getSectionById(params.id)
  if (!section || section.userId !== session.user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { name } = await req.json()
  const updated = await updateSection(params.id, { name })
  return NextResponse.json({ section: updated })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const section = await getSectionById(params.id)
  if (!section || section.userId !== session.user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (section.isVault) return NextResponse.json({ error: 'Cannot delete vault' }, { status: 400 })
  await deleteSection(params.id, session.user.id)
  return NextResponse.json({ ok: true })
}
