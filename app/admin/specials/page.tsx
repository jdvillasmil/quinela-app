import { createClient } from '@/lib/supabase/server'
import type { SpecialPrediction } from '@/types'
import AdminSpecialsClient from './AdminSpecialsClient'

export const metadata = {
  title: 'Predicciones Especiales — Admin',
}

export type UserWithSpecial = {
  id: string
  username: string
  first_name: string
  last_name: string
  special: SpecialPrediction | null
}

export default async function AdminSpecialsPage() {
  const supabase = await createClient()

  const [usersRes, specialsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, username, first_name, last_name')
      .eq('role', 'user')
      .order('username', { ascending: true }),
    supabase.from('special_predictions').select('*'),
  ])

  const users = (usersRes.data ?? []) as Pick<UserWithSpecial, 'id' | 'username' | 'first_name' | 'last_name'>[]
  const specials = (specialsRes.data ?? []) as SpecialPrediction[]

  const specialsMap = new Map(specials.map((s) => [s.user_id, s]))

  const rows: UserWithSpecial[] = users.map((u) => ({
    ...u,
    special: specialsMap.get(u.id) ?? null,
  }))

  return <AdminSpecialsClient users={rows} />
}
