import { createClient } from '@/lib/supabase/server'
import type { Match } from '@/types'
import AdminMatchesClient from './AdminMatchesClient'

export const metadata = {
  title: 'Gestión de Partidos — Admin',
}

export default async function AdminMatchesPage() {
  const supabase = await createClient()

  const { data, error } = await (supabase as any)
    .from('matches')
    .select('*')
    .order('match_number', { ascending: true })

  if (error) {
    console.error('Error fetching matches:', error)
  }

  const matches = (data ?? []) as Match[]

  return <AdminMatchesClient initialMatches={matches} />
}
