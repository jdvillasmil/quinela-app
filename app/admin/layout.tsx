import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Swords, Users, LogOut } from 'lucide-react'
import type { Profile } from '@/types'

export const metadata = {
  title: 'Admin Panel — Quiniela Proyelec',
  description: 'Panel de administración del torneo.',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const userProfile = (profile || {}) as Profile
  if (userProfile.role !== 'admin') {
    redirect('/dashboard')
  }

  const navItems = [
    { label: 'Métricas', href: '/admin', icon: LayoutDashboard },
    { label: 'Partidos', href: '/admin/matches', icon: Swords },
    { label: 'Usuarios', href: '/admin/users', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Desktop / Topbar Mobile */}
      <aside className="w-full md:w-64 bg-navy text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-white/10">
          <Link href="/admin" className="text-xl font-bold tracking-tight">
            Admin<span className="text-skyblue">Proyelec</span>
          </Link>
          <div className="mt-1 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span className="text-xs text-white/60">Sistema Protegido</span>
          </div>
        </div>
        
        <nav className="flex-1 p-3 flex md:flex-col gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link 
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
              >
                <Icon className="w-5 h-5 text-skyblue shrink-0" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10 hidden md:block">
           <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-sm text-gray-300">
             <LogOut className="w-5 h-5" />
             <span>Volver a App</span>
           </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
