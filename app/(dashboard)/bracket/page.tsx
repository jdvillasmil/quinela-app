import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Match, BracketPrediction } from '@/types'
import BracketClient from './BracketClient'

export const metadata = {
  title: 'Bracket Eliminatorio — Quiniela Proyelec',
  description: 'Arma tu árbol hacia la final del Mundial 2026.',
}

export default async function BracketPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch knockout matches
  const { data: matchesRaw, error: matchesError } = await (supabase as any)
    .from('matches')
    .select('*')
    .in('phase', ['r32', 'r16', 'qf', 'sf', 'third', 'final'])
    .order('match_number', { ascending: true })

  if (matchesError) {
    console.error('Error fetching knockout matches:', matchesError)
  }

  // Fetch user bracket predictions
  const { data: predictionsRaw, error: predError } = await (supabase as any)
    .from('bracket_predictions')
    .select('*')
    .eq('user_id', user.id)

  if (predError) {
    console.error('Error fetching bracket predictions:', predError)
  }

  const matches = (matchesRaw ?? []) as Match[]
  const predictions = (predictionsRaw ?? []) as BracketPrediction[]

  // Aggregated prediction stats for R32 matches (security definer bypasses RLS)
  type StatRow = { match_id: number; predicted_home: number; predicted_away: number; prediction_count: number }
  type MatchPredictionStats = Record<number, { stats: Omit<StatRow, 'match_id'>[]; total: number }>

  const r32MatchIds = matches.filter((m) => m.phase === 'r32').map((m) => m.id)
  let matchPredictionStats: MatchPredictionStats = {}

  if (r32MatchIds.length > 0) {
    const { data: statsRaw } = await (supabase as any)
      .rpc('get_bracket_prediction_stats', { p_match_ids: r32MatchIds })
    for (const row of (statsRaw ?? []) as StatRow[]) {
      if (!matchPredictionStats[row.match_id]) {
        matchPredictionStats[row.match_id] = { stats: [], total: 0 }
      }
      matchPredictionStats[row.match_id].stats.push({
        predicted_home: row.predicted_home,
        predicted_away: row.predicted_away,
        prediction_count: row.prediction_count,
      })
      matchPredictionStats[row.match_id].total += Number(row.prediction_count)
    }
  }

  return (
    <BracketClient
      initialMatches={matches}
      initialPredictions={predictions}
      matchPredictionStats={matchPredictionStats}
    />
  )
}
