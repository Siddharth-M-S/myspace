import { auth } from '@/lib/auth'
import { updatePassword, updateVaultPassword, verifyPassword, getUserById } from '@/lib/users'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, currentPassword, newPassword } = await req.json()

  const user = await getUserById(session.user.id)
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Always verify current login password first
  const valid = await verifyPassword(user, currentPassword)
  if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
  }

  if (type === 'login') {
    await updatePassword(session.user.id, newPassword)
  } else if (type === 'vault') {
    await updateVaultPassword(session.user.id, newPassword)
  } else {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
