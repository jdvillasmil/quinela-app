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

  return (
    <BracketClient initialMatches={matches} initialPredictions={predictions} />
  )
}
