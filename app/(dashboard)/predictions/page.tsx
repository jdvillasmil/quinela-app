import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Match, Prediction, SpecialPrediction } from '@/types'
import PredictionsClient from './PredictionsClient'

export const metadata = {
  title: 'Predicciones de Grupos — Quiniela Proyelec',
  description: 'Ingresa tus predicciones para la fase de grupos del Mundial 2026.',
}

export default async function PredictionsPage() {
  const supabase = await createClient()

  // Auth guard
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch all group-stage matches, ordered by match_number
  const { data: matchesRaw, error: matchesError } = await supabase
    .from('matches')
    .select('*')
    .eq('phase', 'groups')
    .order('match_number', { ascending: true })

  if (matchesError) {
    console.error('Error fetching matches:', matchesError)
  }

  const matches = (matchesRaw ?? []) as Match[]

  // Fetch this user's existing predictions for all these matches
  const matchIds = matches.map((m) => m.id)
  let predictionsMap: Map<number, Pick<Prediction, 'predicted_home' | 'predicted_away'>> = new Map()

  if (matchIds.length > 0) {
    const { data: predictionsRaw } = await (supabase as any)
      .from('predictions')
      .select('match_id, predicted_home, predicted_away')
      .eq('user_id', user.id)
      .in('match_id', matchIds)

    for (const p of (predictionsRaw ?? []) as Array<{ match_id: number; predicted_home: number; predicted_away: number }>) {
      predictionsMap.set(p.match_id, {
        predicted_home: p.predicted_home,
        predicted_away: p.predicted_away,
      })
    }
  }

  // Build groupData: { 'A': [...], 'B': [...], ... }
  const groupData: Record<string, (Match & { prediction: Pick<Prediction, 'predicted_home' | 'predicted_away'> | null })[]> = {}

  for (const match of matches) {
    const group = match.group_name ?? 'Otro'
    if (!groupData[group]) groupData[group] = []
    groupData[group].push({
      ...match,
      prediction: predictionsMap.get(match.id) ?? null,
    })
  }

  // Sorted list of groups (A–L)
  const groups = Object.keys(groupData).sort()

  // Fetch user profile for username
  const { data: profileRaw } = await (supabase as any)
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()
  const username: string = (profileRaw as { username?: string } | null)?.username
    ?? user.email?.split('@')[0]
    ?? 'usuario'

  // Fetch special predictions
  const { data: specialRaw } = await (supabase as any)
    .from('special_predictions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const specialPrediction = (specialRaw as SpecialPrediction) ?? null

  // Fetch existing group standings (1°/2° per group)
  const { data: standingsRaw } = await (supabase as any)
    .from('group_predictions')
    .select('group_name, first_place, second_place')
    .eq('user_id', user.id)

  const groupStandingsData: Record<string, { first_place: string; second_place: string } | null> = {}
  for (const gs of (standingsRaw ?? []) as Array<{ group_name: string; first_place: string; second_place: string }>) {
    groupStandingsData[gs.group_name] = { first_place: gs.first_place, second_place: gs.second_place }
  }

  // Fetch aggregated prediction stats for locked matches (security definer bypasses RLS)
  type StatRow = { match_id: number; predicted_home: number; predicted_away: number; prediction_count: number }
  type MatchPredictionStats = Record<number, { stats: Omit<StatRow, 'match_id'>[]; total: number }>

  const lockedMatchIds = matches
    .filter((m) => m.status === 'live' || m.status === 'finished')
    .map((m) => m.id)

  let matchPredictionStats: MatchPredictionStats = {}

  if (lockedMatchIds.length > 0) {
    const { data: statsRaw } = await (supabase as any)
      .rpc('get_match_prediction_stats', { p_match_ids: lockedMatchIds })
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
    <PredictionsClient
      groupData={groupData}
      groups={groups}
      specialPrediction={specialPrediction}
      groupStandingsData={groupStandingsData}
      username={username}
      matchPredictionStats={matchPredictionStats}
    />
  )
}
