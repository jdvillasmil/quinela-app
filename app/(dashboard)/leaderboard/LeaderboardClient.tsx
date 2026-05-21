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
    setTimeout(() => setIsUpdating(false), 800)
  }, [supabase])

  useEffect(() => {
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

  function getRankBadge(rank: number) {
    if (rank === 1) return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-sm tabular-nums">1</span>
    )
    if (rank === 2) return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-400/10 border border-gray-400/25 text-gray-300 font-bold text-sm tabular-nums">2</span>
    )
    if (rank === 3) return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 font-bold text-sm tabular-nums">3</span>
    )
    return <span className="text-sm font-semibold text-gray-600 w-8 text-center inline-block tabular-nums">{rank}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-skyblue" />
            Tabla de Posiciones
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ranking general del torneo actualizado en tiempo real.
          </p>
        </div>
        {isUpdating && (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/8 px-3 py-1.5 rounded-full border border-emerald-500/20 animate-pulse">
            <Activity className="w-3 h-3" />
            Actualizando...
          </div>
        )}
      </div>

      <div className="bg-[#071729] rounded-xl border border-[#1E3A6E]/50 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#030A15] border-b border-[#1E3A6E]/50 text-gray-500 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-center w-16">Pos</th>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4 text-center">Grupos</th>
                <th className="px-6 py-4 text-center">Eliminatorias</th>
                <th className="px-6 py-4 text-center">Especiales</th>
                <th className="px-6 py-4 text-center bg-skyblue/5 text-skyblue">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3A6E]/30">
              {data.map((entry) => {
                const isMe = entry.user_id === currentUserId
                return (
                  <tr
                    key={entry.user_id}
                    className={`transition-colors duration-150 ${
                      isMe
                        ? 'bg-skyblue/6 border-l-2 border-l-skyblue'
                        : 'hover:bg-white/4 border-l-2 border-l-transparent'
                    }`}
                  >
                    <td className="px-6 py-4 text-center">
                      {getRankBadge(entry.rank)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${isMe ? 'text-skyblue' : 'text-gray-200'}`}>
                          @{entry.username}
                        </span>
                        {isMe && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-skyblue/15 text-skyblue px-2 py-0.5 rounded-full border border-skyblue/25">
                            Tú
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-400 font-medium tabular-nums">
                      {entry.group_points}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-400 font-medium tabular-nums">
                      {entry.knockout_points}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-400 font-medium tabular-nums">
                      {entry.special_points}
                    </td>
                    <td className="px-6 py-4 text-center bg-skyblue/5">
                      <span className="text-lg font-bold text-white tabular-nums">
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
