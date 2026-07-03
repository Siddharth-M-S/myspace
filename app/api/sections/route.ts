import { auth } from '@/lib/auth'
import { getSectionsForUser } from '@/lib/sections'
import { createSection } from '@/lib/sections'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sections = await getSectionsForUser(session.user.id)
  return NextResponse.json({ sections })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const section = await createSection(session.user.id, name.trim())
  return NextResponse.json({ section })
}
