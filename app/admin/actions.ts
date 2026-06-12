'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateMatchResult(
  matchId: number,
  homeScore: number,
  awayScore: number,
  status: 'live' | 'finished' = 'finished'
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'No autorizado' }

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, message: 'Acceso denegado' }
  }

  if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore) || homeScore < 0 || awayScore < 0) {
    return { success: false, message: 'Marcador inválido' }
  }

  // Update match
  const { error: updateError } = await (supabase as any)
    .from('matches')
    .update({
      home_score: homeScore,
      away_score: awayScore,
      status,
    })
    .eq('id', matchId)

  if (updateError) {
    console.error('Error actualizando partido:', updateError)
    return { success: false, message: 'Error al actualizar el partido' }
  }

  revalidatePath('/admin/matches')
  revalidatePath('/dashboard')
  revalidatePath('/predictions')

  // Points are only calculated on the final score
  if (status === 'live') {
    return { success: true, message: 'Marcador en vivo actualizado.' }
  }

  // Recalculate points via RPC
  const { error: rpcError } = await (supabase as any).rpc('calculate_match_points', { p_match_id: matchId })

  if (rpcError) {
    console.error('Error calculando puntos:', rpcError)
    return { success: false, message: 'Partido guardado, pero falló el recálculo de puntos' }
  }

  return { success: true, message: 'Partido finalizado y puntos recalculados.' }
}
