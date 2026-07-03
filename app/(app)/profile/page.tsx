'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Check, Key, Lock } from 'lucide-react'

function PasswordForm({
  title,
  description,
  type,
  icon: Icon,
  accentColor,
}: {
  title: string
  description: string
  type: 'login' | 'vault'
  icon: React.ElementType
  accentColor: string
}) {
  const [current, setCurrent] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPw !== confirm) { setError('Passwords do not match'); return }
    if (newPw.length < 6) { setError('New password must be at least 6 characters'); return }
    setError('')
    setLoading(true)

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, currentPassword: current, newPassword: newPw }),
    })

    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setSuccess(true)
      setCurrent(''); setNewPw(''); setConfirm('')
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(data.error || 'Failed to update password')
    }
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input label="Current Login Password" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Your current login password" required />
        <Input label="New Password" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="At least 6 characters" required />
        <Input label="Confirm New Password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat new password" required />

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-500/10 border border-green-500/20">
            <Check className="w-4 h-4 text-green-400" />
            <p className="text-sm text-green-400">Password updated successfully</p>
          </div>
        )}

        <Button type="submit" loading={loading} className="mt-1">Update Password</Button>
      </form>
    </GlassCard>
  )
}

export default function ProfilePage() {
  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Profile Settings</h1>
      <div className="flex flex-col gap-6">
        <PasswordForm
          title="Change Login Password"
          description="Updates your account login password"
          type="login"
          icon={Key}
          accentColor="bg-violet-600/20 border border-violet-500/30 text-violet-400"
        />
        <PasswordForm
          title="Set Vault Password"
          description="Set or change the password to unlock your Vault section"
          type="vault"
          icon={Lock}
          accentColor="bg-amber-600/20 border border-amber-500/30 text-amber-400"
        />
      </div>
    </div>
  )
}
