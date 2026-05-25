'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveSpecialPoints(
  updates: Array<{ user_id: string; points_earned: number }>
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'No autorizado' }

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { success: false, message: 'Acceso denegado' }

  for (const { user_id, points_earned } of updates) {
    const { error } = await (supabase as any)
      .from('special_predictions')
      .update({ points_earned })
      .eq('user_id', user_id)

    if (error) {
      console.error('Error guardando puntos especiales:', error)
      return { success: false, message: `Error al guardar puntos: ${error.message}` }
    }
  }

  revalidatePath('/admin/specials')
  return { success: true, message: `Puntos especiales guardados para ${updates.length} usuario${updates.length !== 1 ? 's' : ''}.` }
}
