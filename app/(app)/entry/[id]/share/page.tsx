'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Share2, Copy, Check, Link as LinkIcon } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ShareEntryPage() {
  const params = useParams()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  async function handleShare() {
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 4) { setError('Password must be at least 4 characters'); return }
    setError('')
    setLoading(true)

    const res = await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId: params.id, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setShareUrl(`${window.location.origin}/shared/${data.token}`)
    } else {
      setError(data.error || 'Failed to create share link')
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Share Entry</h1>
            <p className="text-sm text-gray-400">Create a password-protected share link</p>
          </div>
        </div>

        {!shareUrl ? (
          <div className="flex flex-col gap-4">
            <Input
              label="Share Password"
              type="password"
              placeholder="Set a password for this link"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <p className="text-xs text-gray-500">The link will expire in 30 days. Anyone with the link and password can view this entry.</p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
              <Button onClick={handleShare} loading={loading} className="flex-1">
                <LinkIcon className="w-4 h-4" />
                Generate Link
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <Check className="w-4 h-4 text-green-400 shrink-0" />
              <p className="text-sm text-green-400">Share link created!</p>
            </div>
            <div className="flex gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-gray-300 truncate"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 rounded-lg bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">Share this URL and your password separately. Link expires in 30 days.</p>
            <Button onClick={() => router.back()}>Done</Button>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
