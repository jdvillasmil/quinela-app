'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface SaveResult {
  success: boolean
  message: string
}

export async function saveBracketPredictions(
  payload: { match_id: number; predicted_home: number; predicted_away: number }[]
): Promise<SaveResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'No autorizado.' }
  }

  if (payload.length === 0) {
    return { success: true, message: 'No hay predicciones válidas para guardar.' }
  }

  const upsertData = payload.map((p) => ({
    user_id: user.id,
    match_id: p.match_id,
    predicted_home: p.predicted_home,
    predicted_away: p.predicted_away,
    points_earned: 0,
  }))

  const { error } = await (supabase as any)
    .from('bracket_predictions')
    .upsert(upsertData, { onConflict: 'user_id,match_id' })

  if (error) {
    console.error('Error saving bracket predictions:', error)
    return { success: false, message: 'Error al guardar el bracket.' }
  }

  revalidatePath('/bracket')
  return { success: true, message: 'Bracket guardado correctamente.' }
}
