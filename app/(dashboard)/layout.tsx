import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BottomNav, DesktopNav } from './navigation'
import UserMenu from './user-menu'
import RulesModal from './rules-modal'
import type { Profile } from '@/types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = (await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()) as unknown as { data: Profile | null }

  // Build a profile object ensuring strings are populated or fallback
  const userProfile = {
    username: profile?.username || user.email?.split('@')[0] || 'usuario',
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    email: user.email || '',
    role: profile?.role || 'user',
    avatar_url: profile?.avatar_url || null,
  }

  // Sign out Server Action
  async function handleSignOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#020B18] flex flex-col font-sans">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-navy text-white shadow-md z-50 border-b border-skyblue/10">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo / Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <Image src="/favicon.png" alt="Proyelec" width={32} height={32} priority />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Quiniela <span className="text-skyblue">Proyelec</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <DesktopNav />

          {/* User Profile & Actions */}
          <div className="flex items-center">
            <UserMenu profile={userProfile} onSignOut={handleSignOut} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 pt-16 pb-16 md:pb-0 flex flex-col">
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Mandatory rules modal — shown until user accepts */}
      <RulesModal open={!profile?.rules_accepted_at} />
    </div>
  )
}
