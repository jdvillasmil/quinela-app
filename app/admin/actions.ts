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
  revalidatePath('/bracket')

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

  // If group phase, check whether all group matches are finished and trigger group standing points
  const { data: match } = await (supabase as any)
    .from('matches')
    .select('phase, group_name')
    .eq('id', matchId)
    .single()

  if (match?.phase === 'groups' && match?.group_name) {
    const { data: groupMatches } = await (supabase as any)
      .from('matches')
      .select('status')
      .eq('phase', 'groups')
      .eq('group_name', match.group_name)

    const allFinished = groupMatches?.every((m: { status: string }) => m.status === 'finished')

    if (allFinished) {
      const { error: groupRpcError } = await (supabase as any).rpc('calculate_group_standing_points', {
        p_group_name: match.group_name,
      })

      if (groupRpcError) {
        console.error('Error calculando puntos de clasificación de grupo:', groupRpcError)
        return { success: true, message: 'Partido finalizado y puntos recalculados. (Advertencia: falló el cálculo de clasificación del grupo)' }
      }

      return { success: true, message: `Partido finalizado, puntos recalculados y clasificación del Grupo ${match.group_name} calculada.` }
    }
  }

  return { success: true, message: 'Partido finalizado y puntos recalculados.' }
}
