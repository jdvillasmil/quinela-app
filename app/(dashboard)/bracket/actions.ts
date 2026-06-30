'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface SaveResult {
  success: boolean
  message: string
  saved?: number
  skipped?: number
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
    return { success: true, message: 'No hay predicciones con marcador para guardar.', saved: 0, skipped: 0 }
  }

  const matchIds = payload.map((p) => p.match_id)

  // Re-verify editability server-side: only scheduled matches whose date is still in the future
  const { data: editableMatches, error: fetchError } = await supabase
    .from('matches')
    .select('id')
    .in('id', matchIds)
    .eq('status', 'scheduled')
    .gt('match_date', new Date().toISOString())

  if (fetchError) {
    console.error('Error fetching matches for bracket save:', fetchError)
    return { success: false, message: 'Error al verificar los partidos.' }
  }

  const editableIds = new Set((editableMatches ?? []).map((m) => m.id))
  const validPayload = payload.filter((p) => editableIds.has(p.match_id))
  const skipped = payload.length - validPayload.length

  if (validPayload.length === 0) {
    const msg =
      skipped === 1
        ? '1 partido ya inició y no se pudo modificar.'
        : `Los ${skipped} partidos ya iniciaron y no se pudieron modificar.`
    return { success: false, message: msg, saved: 0, skipped }
  }

  const upsertData = validPayload.map((p) => ({
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

  const saved = validPayload.length
  let message: string

  if (skipped === 0) {
    message =
      saved === 1
        ? '1 predicción guardada correctamente.'
        : `${saved} predicciones guardadas correctamente.`
  } else {
    const savedPart = `${saved} guardado${saved !== 1 ? 's' : ''}`
    const skippedPart =
      skipped === 1
        ? '1 partido ya inició y no se pudo modificar'
        : `${skipped} partidos ya iniciaron y no se pudieron modificar`
    message = `${savedPart}, ${skippedPart}.`
  }

  return { success: true, message, saved, skipped }
}
