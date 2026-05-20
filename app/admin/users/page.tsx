import { createClient } from '@/lib/supabase/server'
import type { Profile, LeaderboardEntry } from '@/types'
import AdminUsersClient from './AdminUsersClient'

export const metadata = {
  title: 'Gestión de Usuarios — Admin',
}

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // Fetch users
  const { data: usersRaw, error: usersError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch leaderboard for CSV
  const { data: leaderboardRaw, error: boardError } = await (supabase as any)
    .from('leaderboard')
    .select('*')
    .order('rank', { ascending: true })

  if (usersError) console.error('Error fetching users:', usersError)
  if (boardError) console.error('Error fetching leaderboard:', boardError)

  const users = (usersRaw ?? []) as Profile[]
  const leaderboard = (leaderboardRaw ?? []) as LeaderboardEntry[]

  return <AdminUsersClient users={users} leaderboard={leaderboard} />
}
