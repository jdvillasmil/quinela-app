'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface UpsertPrediction {
  match_id: number
  predicted_home: number
  predicted_away: number
}

export interface SaveResult {
  success: boolean
  message: string
}

export async function saveGroupPredictions(
  predictions: UpsertPrediction[]
): Promise<SaveResult> {
  if (!predictions || predictions.length === 0) {
    return { success: false, message: 'No hay predicciones para guardar.' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'No autorizado.' }
  }

  // Validate all values are non-negative integers
  for (const p of predictions) {
    if (
      !Number.isInteger(p.predicted_home) ||
      !Number.isInteger(p.predicted_away) ||
      p.predicted_home < 0 ||
      p.predicted_away < 0 ||
      p.predicted_home > 30 ||
      p.predicted_away > 30
    ) {
      return { success: false, message: 'Valores de marcador inválidos.' }
    }
  }

  const rows = predictions.map((p) => ({
    user_id: user.id,
    match_id: p.match_id,
    predicted_home: p.predicted_home,
    predicted_away: p.predicted_away,
    points_earned: 0,
  }))

  const { error } = await (supabase as any)
    .from('predictions')
    .upsert(rows, { onConflict: 'user_id,match_id' })

  if (error) {
    console.error('Error saving predictions:', error)
    return { success: false, message: 'Error al guardar. Intenta de nuevo.' }
  }

  revalidatePath('/predictions')
  return { success: true, message: 'Predicciones guardadas correctamente.' }
}

export interface GroupStandingsPayload {
  group_name: string
  first_place: string
  second_place: string
}

export async function saveGroupStandings(
  payload: GroupStandingsPayload
): Promise<SaveResult> {
  if (!payload.first_place || !payload.second_place) {
    return { success: false, message: 'Selecciona 1° y 2° del grupo.' }
  }
  if (payload.first_place === payload.second_place) {
    return { success: false, message: 'El 1° y 2° no pueden ser el mismo equipo.' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, message: 'No autorizado.' }

  const { error } = await (supabase as any)
    .from('group_predictions')
    .upsert(
      {
        user_id: user.id,
        group_name: payload.group_name,
        first_place: payload.first_place,
        second_place: payload.second_place,
        points_earned: 0,
      },
      { onConflict: 'user_id,group_name' }
    )

  if (error) {
    console.error('Error saving group standings:', error)
    return { success: false, message: 'Error al guardar clasificados. Intenta de nuevo.' }
  }

  revalidatePath('/predictions')
  return { success: true, message: 'Clasificados guardados correctamente.' }
}

export interface SpecialPredictionPayload {
  top_scorer: string | null
  best_player: string | null
  best_keeper: string | null
  total_goals: number | null
  fastest_goal_team: string | null
}

export async function saveSpecialPredictions(
  payload: SpecialPredictionPayload
): Promise<SaveResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'No autorizado.' }
  }

  if (payload.total_goals !== null && (!Number.isInteger(payload.total_goals) || payload.total_goals < 0)) {
    return { success: false, message: 'Total de goles debe ser un entero positivo.' }
  }

  const { error } = await (supabase as any)
    .from('special_predictions')
    .upsert(
      {
        user_id: user.id,
        top_scorer: payload.top_scorer,
        best_player: payload.best_player,
        best_keeper: payload.best_keeper,
        total_goals: payload.total_goals,
        fastest_goal_team: payload.fastest_goal_team,
        points_earned: 0,
      },
      { onConflict: 'user_id' }
    )

  if (error) {
    console.error('Error saving special predictions:', error)
    return { success: false, message: 'Error al guardar premios especiales.' }
  }

  revalidatePath('/predictions')
  return { success: true, message: 'Premios especiales guardados correctamente.' }
}
