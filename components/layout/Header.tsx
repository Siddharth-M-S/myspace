'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Search, Plus, LogOut, User, Shield, Upload } from 'lucide-react'
import { useSearchModal } from '@/components/search/SearchContext'

interface HeaderProps {
  username: string
  role: string
}

export function Header({ username, role }: HeaderProps) {
  const { openSearch } = useSearchModal()

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-white/10 bg-[#0d0d1a]/80 backdrop-blur-xl flex items-center px-4 gap-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mr-4 shrink-0">
        <span className="text-violet-400 text-lg">✦</span>
        <span className="font-bold text-white text-lg tracking-tight">My Space</span>
      </Link>

      {/* Search bar */}
      <button
        onClick={openSearch}
        className="flex-1 max-w-md flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-sm text-gray-400 hover:text-gray-300 transition-all duration-200 group"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search notes...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-white/5 border border-white/10 text-gray-500">
          ⌘K
        </kbd>
      </button>

      <div className="flex items-center gap-2 ml-auto">
        {/* New Entry */}
        <Link
          href="/entry/new"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors shadow-lg shadow-violet-500/20"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Entry</span>
        </Link>

        {/* Import */}
        <Link
          href="/import"
          title="Import .md file"
          className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors"
        >
          <Upload className="w-4 h-4" />
        </Link>

        {/* User menu */}
        <div className="relative group">
          <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <div className="w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center">
              <span className="text-xs font-semibold text-violet-300">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="hidden sm:block text-sm text-gray-300">{username}</span>
          </button>

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-white/10 bg-[#0d0d1a]/95 backdrop-blur-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <div className="p-1">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              {role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
              <div className="my-1 border-t border-white/5" />
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
