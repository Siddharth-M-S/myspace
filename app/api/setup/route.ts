import { adminExists, createUser } from '@/lib/users'
import { NextResponse } from 'next/server'

// One-time setup endpoint to create first admin
// Protected by SETUP_SECRET env var
// DELETE or disable this route after first use
export async function POST(req: Request) {
  const secret = req.headers.get('x-setup-secret')
  if (!secret || secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const exists = await adminExists()
  if (exists) {
    return NextResponse.json({ error: 'Admin already exists' }, { status: 400 })
  }

  const { username, password } = await req.json()
  if (!username || !password) {
    return NextResponse.json({ error: 'username and password required' }, { status: 400 })
  }

  const user = await createUser(username, password, 'admin')
  return NextResponse.json({ ok: true, username: user.username, role: user.role })
}
