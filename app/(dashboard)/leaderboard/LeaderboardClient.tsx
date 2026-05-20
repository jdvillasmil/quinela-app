'use client'

import { useEffect, useState, useCallback } from 'react'
import { Trophy, Activity } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { LeaderboardEntry } from '@/types'

export default function LeaderboardClient({ 
  initialData, 
  currentUserId 
}: { 
  initialData: LeaderboardEntry[], 
  currentUserId: string 
}) {
  const [data, setData] = useState<LeaderboardEntry[]>(initialData)
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClient()

  const fetchLeaderboard = useCallback(async () => {
    setIsUpdating(true)
    const { data: newData, error } = await (supabase as any)
      .from('leaderboard')
      .select('*')
      .order('rank', { ascending: true })

    if (!error && newData) {
      setData(newData as LeaderboardEntry[])
    }
    // Simulate slight delay to show updating indicator visually
    setTimeout(() => setIsUpdating(false), 800)
  }, [supabase])

  useEffect(() => {
    // Subscribe to changes on any table that might affect the score
    const channel = supabase.channel('leaderboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'predictions' }, fetchLeaderboard)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_predictions' }, fetchLeaderboard)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'special_predictions' }, fetchLeaderboard)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bracket_predictions' }, fetchLeaderboard)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, fetchLeaderboard)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchLeaderboard])

  function getMedal(rank: number) {
    if (rank === 1) return <span className="text-2xl" title="Oro">🥇</span>
    if (rank === 2) return <span className="text-2xl" title="Plata">🥈</span>
    if (rank === 3) return <span className="text-2xl" title="Bronce">🥉</span>
    return <span className="text-lg font-bold text-gray-400 w-8 text-center inline-block">{rank}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Trophy className="w-6 h-6 text-skyblue" />
            Tabla de Posiciones
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ranking general del torneo actualizado en tiempo real.
          </p>
        </div>
        {isUpdating && (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 animate-pulse">
            <Activity className="w-3 h-3" />
            Actualizando...
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-center w-16">Pos</th>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4 text-center">Grupos</th>
                <th className="px-6 py-4 text-center">Eliminatorias</th>
                <th className="px-6 py-4 text-center">Especiales</th>
                <th className="px-6 py-4 text-center bg-skyblue/5 text-navy rounded-t-lg">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((entry) => {
                const isMe = entry.user_id === currentUserId
                return (
                  <tr 
                    key={entry.user_id} 
                    className={`transition-colors hover:bg-gray-50 ${isMe ? 'bg-skyblue/5 border-l-4 border-l-skyblue' : 'border-l-4 border-l-transparent'}`}
                  >
                    <td className="px-6 py-4 text-center">
                      {getMedal(entry.rank)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${isMe ? 'text-skyblue' : 'text-navy'}`}>
                          @{entry.username}
                        </span>
                        {isMe && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-navy text-white px-2 py-0.5 rounded-full">
                            Tú
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500 font-medium">
                      {entry.group_points}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500 font-medium">
                      {entry.knockout_points}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500 font-medium">
                      {entry.special_points}
                    </td>
                    <td className="px-6 py-4 text-center bg-skyblue/5">
                      <span className="text-lg font-bold text-navy">
                        {entry.total_points}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {data.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aún no hay puntuaciones registradas en el torneo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
