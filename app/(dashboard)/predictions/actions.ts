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
