import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { LeaderboardEntry } from '@/types'
import LeaderboardClient from './LeaderboardClient'

export const metadata = {
  title: 'Leaderboard — Quiniela Proyelec',
  description: 'Ranking en tiempo real de la Quiniela Mundial 2026.',
}

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawLeaderboard, error } = await (supabase as any)
    .from('leaderboard')
    .select('*')
    .order('rank', { ascending: true })

  if (error) {
    console.error('Error fetching leaderboard:', error)
  }

  const leaderboard = (rawLeaderboard ?? []) as LeaderboardEntry[]

  return (
    <LeaderboardClient initialData={leaderboard} currentUserId={user.id} />
  )
}
