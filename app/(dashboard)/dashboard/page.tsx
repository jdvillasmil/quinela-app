import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { LeaderboardEntry } from '@/types'
import DashboardClient from './DashboardClient'

export const metadata: Metadata = {
  title: 'Inicio — Quiniela Proyelec',
}

export interface R32Match {
  id: number
  home_team: string
  away_team: string
  home_flag: string | null
  away_flag: string | null
  match_date: string
  venue: string | null
  group_name: string | null
  status: 'scheduled' | 'live' | 'finished'
  home_score: number | null
  away_score: number | null
  day_label: 'Hoy' | 'Mañana'
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

// La app muestra horarios en America/Caracas (UTC-4, sin horario de verano).
const CARACAS_OFFSET_MS = 4 * 60 * 60 * 1000

function caracasDateKey(d: Date): string {
  return new Date(d.getTime() - CARACAS_OFFSET_MS).toISOString().slice(0, 10)
}

// Límites [start, end) de un día calendario en Caracas, offset por días desde hoy.
function caracasDayBounds(daysFromToday: number): { start: Date; end: Date } {
  const caracasNow = new Date(Date.now() - CARACAS_OFFSET_MS)
  const y = caracasNow.getUTCFullYear()
  const m = caracasNow.getUTCMonth()
  const d = caracasNow.getUTCDate()
  const start = new Date(Date.UTC(y, m, d + daysFromToday) + CARACAS_OFFSET_MS)
  const end = new Date(Date.UTC(y, m, d + daysFromToday + 1) + CARACAS_OFFSET_MS)
  return { start, end }
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

const KNOCKOUT_PHASES = ['r32', 'r16', 'qf', 'sf', 'third', 'final'] as const

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = caracasDayBounds(0)
  const tomorrow = caracasDayBounds(1)
  const todayKey = caracasDateKey(today.start)

  const [
    profileRes,
    entryRes,
    usersRes,
    groupMatchesRes,
    r32MatchesRes,
    bracketPredsRes,
    finishedKnockoutRes,
  ] = await Promise.all([
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
      .select('id, home_team, away_team, home_flag, away_flag, match_date, venue, group_name, status, home_score, away_score')
      .eq('phase', 'r32')
      .gte('match_date', today.start.toISOString())
      .lt('match_date', tomorrow.end.toISOString())
      .order('match_date', { ascending: true }),
    supabase
      .from('bracket_predictions')
      .select('match_id, points_earned')
      .eq('user_id', user.id),
    supabase
      .from('matches')
      .select('id')
      .in('phase', KNOCKOUT_PHASES)
      .eq('status', 'finished'),
  ])

  const profile = profileRes.data as { first_name: string | null; username: string } | null
  const entryRaw = entryRes.data
  const totalUsers = usersRes.count
  const groupMatches = (groupMatchesRes.data ?? []) as GroupMatch[]
  const entry = (entryRaw as LeaderboardEntry) ?? null
  const matchIds = groupMatches.map((m) => m.id)

  const r32Matches: R32Match[] = ((r32MatchesRes.data ?? []) as Omit<R32Match, 'day_label'>[]).map((m) => ({
    ...m,
    day_label: caracasDateKey(new Date(m.match_date)) === todayKey ? 'Hoy' : 'Mañana',
  }))

  const bracketPreds = (bracketPredsRes.data ?? []) as Array<{ match_id: number; points_earned: number }>
  const finishedKnockoutIds = new Set(((finishedKnockoutRes.data ?? []) as Array<{ id: number }>).map((m) => m.id))
  const decidedBracketPreds = bracketPreds.filter((p) => finishedKnockoutIds.has(p.match_id))
  const bracketPoints = entry?.knockout_points ?? 0
  const bracketCorrect = decidedBracketPreds.filter((p) => p.points_earned > 0).length
  const bracketDecided = decidedBracketPreds.length

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
      r32Matches={r32Matches}
      bracketPoints={bracketPoints}
      bracketCorrect={bracketCorrect}
      bracketDecided={bracketDecided}
      groupStandings={groupStandings}
    />
  )
}
