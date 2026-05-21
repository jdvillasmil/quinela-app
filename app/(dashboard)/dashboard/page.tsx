import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { LeaderboardEntry } from '@/types'
import DashboardClient from './DashboardClient'

export const metadata: Metadata = {
  title: 'Inicio — Quiniela Proyelec',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, entryRes, usersRes, matchesRes] = await Promise.all([
    supabase.from('profiles').select('first_name, username').eq('id', user.id).single(),
    (supabase as any).from('leaderboard').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
    supabase.from('matches').select('id').eq('phase', 'groups'),
  ])

  const profile = profileRes.data as { first_name: string | null; username: string } | null
  const entryRaw = entryRes.data
  const totalUsers = usersRes.count
  const groupMatchIds = matchesRes.data

  const entry = (entryRaw as LeaderboardEntry) ?? null
  const matchIds = (groupMatchIds ?? []).map((m: { id: number }) => m.id)

  let predictionsCount = 0
  if (matchIds.length > 0) {
    const { count } = await supabase
      .from('predictions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('match_id', matchIds)
    predictionsCount = count ?? 0
  }

  return (
    <DashboardClient
      firstName={profile?.first_name || profile?.username || ''}
      entry={entry}
      totalUsers={totalUsers ?? 0}
      predictionsCount={predictionsCount}
    />
  )
}
