'use client'

import { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useVault } from './VaultContext'

export function VaultUnlockModal() {
  const { showUnlockModal, setShowUnlockModal, setVaultUnlocked } = useVault()
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/vault/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    setLoading(false)

    if (res.ok) {
      setVaultUnlocked(true)
      setShowUnlockModal(false)
      setPassword('')
    } else {
      setError('Incorrect vault password')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <Modal
      open={showUnlockModal}
      onClose={() => { setShowUnlockModal(false); setPassword(''); setError('') }}
      className="max-w-sm"
    >
      <div className={`flex flex-col items-center gap-6 ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Lock className="w-7 h-7 text-amber-400" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-white">Unlock Vault</h2>
            <p className="text-sm text-gray-400 mt-1">Enter your vault password to access private content</p>
          </div>
        </div>

        <form onSubmit={handleUnlock} className="w-full flex flex-col gap-3">
          <div className="relative">
            <input
              autoFocus
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Vault password"
              className="w-full rounded-lg bg-white/5 border border-amber-500/20 px-3 py-2.5 pr-10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <Button
            type="submit"
            loading={loading}
            className="w-full bg-amber-600 hover:bg-amber-500 shadow-amber-500/20"
          >
            <Lock className="w-4 h-4" />
            Unlock
          </Button>
        </form>
      </div>
    </Modal>
  )
}
