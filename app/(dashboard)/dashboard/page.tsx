import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-4">⚽</p>
        <h1 className="text-2xl font-semibold text-navy">Dashboard</h1>
        <p className="text-[#444444] text-sm mt-2">Próximamente — Sprint 3</p>
        <p className="text-xs text-gray-400 mt-4">{user.email}</p>
      </div>
    </main>
  )
}
