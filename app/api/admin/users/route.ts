import { auth } from '@/lib/auth'
import { getAllUsers, createUser } from '@/lib/users'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const users = await getAllUsers()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const safe = users.map(({ hashedPassword: _hp, vaultHashedPassword: _vp, ...u }) => u)
  return NextResponse.json({ users: safe })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { username, password, role } = await req.json()
  if (!username || !password) return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
  try {
    const user = await createUser(username, password, role || 'user')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword: _hp, vaultHashedPassword: _vp, ...safe } = user
    return NextResponse.json({ user: safe })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
