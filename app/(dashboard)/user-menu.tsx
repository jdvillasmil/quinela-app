'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { User, LogOut, Shield } from 'lucide-react'

interface UserProfile {
  username: string
  first_name: string
  last_name: string
  email: string
  role: string
  avatar_url: string | null
}

interface UserMenuProps {
  profile: UserProfile
  onSignOut: () => Promise<void>
}

export default function UserMenu({ profile, onSignOut }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || profile.username?.[0]?.toUpperCase() || 'U'
  const isAdmin = profile.role === 'admin'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-skyblue/25 border-2 border-skyblue/40 hover:border-skyblue text-skyblue hover:bg-skyblue/30 transition-all duration-200 focus:outline-none"
      >
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="text-sm font-semibold tracking-wide">{initials}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-64 bg-navy border border-skyblue/20 rounded-card shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-md z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-5 py-4 border-b border-skyblue/10 bg-black/10">
            <p className="text-xs font-semibold text-skyblue tracking-wider uppercase">Usuario</p>
            <p className="text-white font-semibold text-sm mt-1 truncate">
              {profile.first_name || profile.last_name ? `${profile.first_name} ${profile.last_name}`.trim() : 'Usuario Proyelec'}
            </p>
            <p className="text-gray-400 text-xs truncate">@{profile.username}</p>
            <p className="text-gray-400 text-xs truncate mt-0.5">{profile.email}</p>
            
            {isAdmin && (
              <span className="inline-flex items-center space-x-1 mt-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                <Shield className="w-3 h-3" />
                <span>Administrador</span>
              </span>
            )}
          </div>

          <div className="p-2 space-y-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-element text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              <User className="w-4 h-4 text-skyblue" />
              <span>Ver mi perfil</span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-element text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Panel de Admin</span>
              </Link>
            )}

            <form action={onSignOut}>
              <button
                type="submit"
                className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-element text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
