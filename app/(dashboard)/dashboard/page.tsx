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

export interface LiveMatch extends NextMatch {
  home_score: number | null
  away_score: number | null
}

export interface TeamStats {
  team: string
  flag: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

export interface GroupStanding {
  groupName: string
  teams: TeamStats[]
}

type GroupMatch = {
  id: number
  home_team: string
  away_team: string
  home_flag: string | null
  away_flag: string | null
  group_name: string | null
}

function computeStandings(
  matches: GroupMatch[],
  predMap: Map<number, { predicted_home: number; predicted_away: number }>
): TeamStats[] {
  const flagMap: Record<string, string> = {}
  for (const m of matches) {
    flagMap[m.home_team] = m.home_flag ?? '🏳️'
    flagMap[m.away_team] = m.away_flag ?? '🏳️'
  }

  const stats: Record<string, TeamStats> = {}
  for (const team of Object.keys(flagMap)) {
    stats[team] = { team, flag: flagMap[team], played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
  }

  for (const m of matches) {
    const pred = predMap.get(m.id)
    if (!pred) continue
    const h = pred.predicted_home
    const a = pred.predicted_away

    stats[m.home_team].played++
    stats[m.away_team].played++
    stats[m.home_team].goalsFor += h
    stats[m.home_team].goalsAgainst += a
    stats[m.away_team].goalsFor += a
    stats[m.away_team].goalsAgainst += h

    if (h > a) {
      stats[m.home_team].won++
      stats[m.home_team].points += 3
      stats[m.away_team].lost++
    } else if (h < a) {
      stats[m.away_team].won++
      stats[m.away_team].points += 3
      stats[m.home_team].lost++
    } else {
      stats[m.home_team].drawn++
      stats[m.home_team].points++
      stats[m.away_team].drawn++
      stats[m.away_team].points++
    }
  }

  return Object.values(stats).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    const gdA = a.goalsFor - a.goalsAgainst
    const gdB = b.goalsFor - b.goalsAgainst
    if (gdB !== gdA) return gdB - gdA
    return b.goalsFor - a.goalsFor
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, entryRes, usersRes, groupMatchesRes, nextMatchesRes, liveMatchesRes] = await Promise.all([
    supabase.from('profiles').select('first_name, username').eq('id', user.id).single(),
    (supabase as any).from('leaderboard').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
    supabase
      .from('matches')
      .select('id, home_team, away_team, home_flag, away_flag, group_name')
      .eq('phase', 'groups')
      .order('match_number', { ascending: true }),
    supabase
      .from('matches')
      .select('id, home_team, away_team, home_flag, away_flag, match_date, venue, group_name')
      .eq('phase', 'groups')
      .eq('status', 'scheduled')
      .order('match_date', { ascending: true })
      .limit(3),
    supabase
      .from('matches')
      .select('id, home_team, away_team, home_flag, away_flag, match_date, venue, group_name, home_score, away_score')
      .eq('status', 'live')
      .order('match_date', { ascending: true }),
  ])

  const profile = profileRes.data as { first_name: string | null; username: string } | null
  const entryRaw = entryRes.data
  const totalUsers = usersRes.count
  const groupMatches = (groupMatchesRes.data ?? []) as GroupMatch[]
  const nextMatches = (nextMatchesRes.data ?? []) as NextMatch[]
  const liveMatches = (liveMatchesRes.data ?? []) as LiveMatch[]
  const entry = (entryRaw as LeaderboardEntry) ?? null
  const matchIds = groupMatches.map((m) => m.id)

  let predictions: Array<{ match_id: number; predicted_home: number; predicted_away: number }> = []
  if (matchIds.length > 0) {
    const { data } = await supabase
      .from('predictions')
      .select('match_id, predicted_home, predicted_away')
      .eq('user_id', user.id)
      .in('match_id', matchIds)
    predictions = (data ?? []) as typeof predictions
  }

  const predictionsCount = predictions.length

  const predMap = new Map(predictions.map((p) => [p.match_id, { predicted_home: p.predicted_home, predicted_away: p.predicted_away }]))

  const groupMatchesMap: Record<string, GroupMatch[]> = {}
  for (const m of groupMatches) {
    const g = m.group_name ?? 'Otro'
    if (!groupMatchesMap[g]) groupMatchesMap[g] = []
    groupMatchesMap[g].push(m)
  }

  const groupStandings: GroupStanding[] = Object.entries(groupMatchesMap)
    .filter(([, matches]) => matches.some((m) => predMap.has(m.id)))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([groupName, matches]) => ({
      groupName,
      teams: computeStandings(matches, predMap),
    }))

  return (
    <DashboardClient
      firstName={profile?.first_name || profile?.username || ''}
      entry={entry}
      totalUsers={totalUsers ?? 0}
      predictionsCount={predictionsCount}
      nextMatches={nextMatches}
      liveMatches={liveMatches}
      groupStandings={groupStandings}
    />
  )
}
