'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface VaultContextType {
  vaultUnlocked: boolean
  openVaultUnlock: () => void
  lockVault: () => void
  setVaultUnlocked: (val: boolean) => void
  showUnlockModal: boolean
  setShowUnlockModal: (val: boolean) => void
}

const VaultContext = createContext<VaultContextType>({
  vaultUnlocked: false,
  openVaultUnlock: () => {},
  lockVault: () => {},
  setVaultUnlocked: () => {},
  showUnlockModal: false,
  setShowUnlockModal: () => {},
})

export function VaultProvider({ children }: { children: ReactNode }) {
  const [vaultUnlocked, setVaultUnlocked] = useState(false)
  const [showUnlockModal, setShowUnlockModal] = useState(false)

  function openVaultUnlock() {
    setShowUnlockModal(true)
  }

  function lockVault() {
    setVaultUnlocked(false)
  }

  return (
    <VaultContext.Provider
      value={{ vaultUnlocked, openVaultUnlock, lockVault, setVaultUnlocked, showUnlockModal, setShowUnlockModal }}
    >
      {children}
    </VaultContext.Provider>
  )
}

export function useVault() {
  return useContext(VaultContext)
}
