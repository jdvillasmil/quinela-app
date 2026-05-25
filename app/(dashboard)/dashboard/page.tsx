import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { LeaderboardEntry } from '@/types'
import DashboardClient from './DashboardClient'

export const metadata: Metadata = {
  title: 'Inicio — Quiniela Proyelec',
}

export interface NextMatch {
  id: number
  home_team: string
  away_team: string
  home_flag: string | null
  away_flag: string | null
  match_date: string
  venue: string | null
  group_name: string | null
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, entryRes, usersRes, matchesRes, nextMatchesRes] = await Promise.all([
    supabase.from('profiles').select('first_name, username').eq('id', user.id).single(),
    (supabase as any).from('leaderboard').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
    supabase.from('matches').select('id').eq('phase', 'groups'),
    supabase
      .from('matches')
      .select('id, home_team, away_team, home_flag, away_flag, match_date, venue, group_name')
      .eq('phase', 'groups')
      .eq('status', 'scheduled')
      .order('match_date', { ascending: true })
      .limit(3),
  ])

  const profile = profileRes.data as { first_name: string | null; username: string } | null
  const entryRaw = entryRes.data
  const totalUsers = usersRes.count
  const groupMatchIds = matchesRes.data
  const nextMatches = (nextMatchesRes.data ?? []) as NextMatch[]

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
      nextMatches={nextMatches}
    />
  )
}
