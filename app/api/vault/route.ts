import { auth } from '@/lib/auth'
import { verifyVaultPassword } from '@/lib/users'
import { getUserById } from '@/lib/users'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { password } = await req.json()
  if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 })

  const user = await getUserById(session.user.id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (!user.vaultHashedPassword) {
    return NextResponse.json({ error: 'Vault password not set. Set it in your profile first.' }, { status: 400 })
  }

  const valid = await verifyVaultPassword(user, password)
  if (!valid) return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })

  return NextResponse.json({ ok: true })
}
