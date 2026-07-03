import { auth } from '@/lib/auth'
import { getUserById, deleteUser, updatePassword } from '@/lib/users'
import { NextResponse } from 'next/server'

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (params.id === session.user.id) return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })
  await deleteUser(params.id)
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { password } = await req.json()
  if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 })
  const user = await getUserById(params.id)
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await updatePassword(params.id, password)
  return NextResponse.json({ ok: true })
}
