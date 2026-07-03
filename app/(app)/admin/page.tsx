'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Shield, Plus, Trash2, RotateCcw, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface SafeUser {
  id: string
  username: string
  role: string
  createdAt: string
}

export default function AdminPage() {
  const { data, mutate } = useSWR('/api/admin/users', fetcher)
  const users: SafeUser[] = data?.users || []

  const [createOpen, setCreateOpen] = useState(false)
  const [resetId, setResetId] = useState<string | null>(null)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user')
  const [resetPw, setResetPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) { setCreateOpen(false); setNewUsername(''); setNewPassword(''); mutate() }
    else setError(data.error)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this user and all their data?')) return
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    mutate()
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch(`/api/admin/users/${resetId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: resetPw }),
    })
    setLoading(false)
    setResetId(null)
    setResetPw('')
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-sm text-gray-400">{users.length} users</p>
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" />
          New User
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {users.map((user) => (
          <GlassCard key={user.id} className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-violet-600/20 border border-violet-500/20 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-violet-300">{user.username.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{user.username}</span>
                {user.role === 'admin' && (
                  <span className="px-1.5 py-0.5 rounded text-xs bg-violet-600/30 text-violet-300 border border-violet-500/20">admin</span>
                )}
              </div>
              <p className="text-xs text-gray-500">Joined {formatDate(user.createdAt)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setResetId(user.id); setResetPw('') }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset PW
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(user.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Create user modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create User">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input label="Username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required />
          <Input label="Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as 'user' | 'admin')}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            >
              <option value="user" className="bg-[#1a1a2e]">User</option>
              <option value="admin" className="bg-[#1a1a2e]">Admin</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            <User className="w-4 h-4" />
            Create User
          </Button>
        </form>
      </Modal>

      {/* Reset password modal */}
      <Modal open={!!resetId} onClose={() => setResetId(null)} title="Reset Password">
        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <Input label="New Password" type="password" value={resetPw} onChange={(e) => setResetPw(e.target.value)} required />
          <Button type="submit" loading={loading} className="w-full">Reset Password</Button>
        </form>
      </Modal>
    </div>
  )
}
