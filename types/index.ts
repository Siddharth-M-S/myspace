export type UserRole = 'admin' | 'user'

export interface User {
  id: string
  username: string
  hashedPassword: string
  role: UserRole
  vaultHashedPassword?: string
  createdAt: string
  updatedAt: string
}

export interface Section {
  id: string
  name: string
  userId: string
  order: number
  isVault: boolean
  createdAt: string
}

export type EntryType = 'note' | 'file'

export interface Entry {
  id: string
  type: EntryType
  title: string
  content: string
  tags: string[]
  source: string
  sectionId: string
  userId: string
  isVault: boolean
  createdAt: string
  updatedAt: string
  // file-specific fields (only when type === 'file')
  fileUrl?: string
  filePublicId?: string
  fileName?: string
  fileType?: string
  fileSize?: number
}

export interface ShareLink {
  token: string
  entryId: string
  hashedPassword: string
  createdAt: string
  expiresAt: string
}

export interface SearchResult {
  id: string
  title: string
  excerpt: string
  sectionId: string
  sectionName: string
  createdAt: string
  isVault: boolean
}

// Session user (safe to expose)
export interface SessionUser {
  id: string
  username: string
  role: UserRole
}
