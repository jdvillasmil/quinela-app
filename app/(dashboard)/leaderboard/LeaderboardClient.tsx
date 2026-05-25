'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Activity } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { LeaderboardEntry } from '@/types'

const LS_KEY = 'leaderboard_positions'
const GROUP_MATCHES = 72

function getMovement(username: string, currentRank: number, prev: Record<string, number>): number | null {
  if (!(username in prev)) return null
  return prev[username] - currentRank // positive = moved up
}

function MovementBadge({ delta }: { delta: number | null }) {
  if (delta === null || delta === 0) return (
    <span className="text-xs text-gray-600 tabular-nums w-10 inline-block text-center">—</span>
  )
  if (delta > 0) return (
    <span className="text-xs font-semibold text-emerald-400 tabular-nums w-10 inline-block text-center">▲{delta}</span>
  )
  return (
    <span className="text-xs font-semibold text-red-400 tabular-nums w-10 inline-block text-center">▼{Math.abs(delta)}</span>
  )
}

function getInitials(entry: LeaderboardEntry): string {
  const f = entry.first_name?.[0] ?? ''
  const l = entry.last_name?.[0] ?? ''
  return (f + l).toUpperCase() || entry.username[0].toUpperCase()
}

// ─── Podium ───────────────────────────────────────────────────────────────────

function PodiumCard({
  entry,
  rank,
  large,
}: {
  entry: LeaderboardEntry
  rank: 1 | 2 | 3
  large?: boolean
}) {
  const router = useRouter()
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'

  const borderColor =
    rank === 1
      ? 'border-amber-500/40 bg-navy'
      : rank === 2
      ? 'border-gray-400/25 bg-[#071729]'
      : 'border-orange-500/25 bg-[#071729]'

  const avatarColor =
    rank === 1
      ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
      : rank === 2
      ? 'bg-gray-400/10 border-gray-400/20 text-gray-300'
      : 'bg-orange-500/10 border-orange-500/20 text-orange-400'

  const avatarSize = large ? 'w-14 h-14 text-xl' : 'w-11 h-11 text-base'
  const nameSize = large ? 'text-sm font-bold' : 'text-xs font-semibold'
  const pointsSize = large ? 'text-2xl font-bold' : 'text-lg font-bold'

  return (
    <button
      onClick={() => router.push(`/profile/${entry.username}`)}
      className={`w-full flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border ${borderColor} transition-all duration-150 hover:scale-[1.03] hover:brightness-110 cursor-pointer text-center`}
    >
      <span className="text-xl leading-none">{medal}</span>
      <div className={`${avatarSize} rounded-xl ${avatarColor} border flex items-center justify-center flex-shrink-0 font-bold`}>
        {getInitials(entry)}
      </div>
      <div className="min-w-0 w-full">
        <p className={`${nameSize} text-white truncate`}>
          {entry.first_name && entry.last_name
            ? `${entry.first_name} ${entry.last_name}`
            : entry.username}
        </p>
        <p className="text-[10px] text-gray-500 truncate">@{entry.username}</p>
      </div>
      <p className={`${pointsSize} text-white tabular-nums leading-none`}>
        {entry.total_points}
        <span className="text-xs font-normal text-gray-500 ml-1">pts</span>
      </p>
    </button>
  )
}

// ─── Main client ──────────────────────────────────────────────────────────────

export default function LeaderboardClient({
  initialData,
  currentUserId,
}: {
  initialData: LeaderboardEntry[]
  currentUserId: string
}) {
  const [data, setData] = useState<LeaderboardEntry[]>(initialData)
  const [isUpdating, setIsUpdating] = useState(false)
  const [prevPositions, setPrevPositions] = useState<Record<string, number>>({})
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    let stored: Record<string, number> = {}
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) stored = JSON.parse(raw)
    } catch { /* ignore */ }
    setPrevPositions(stored)

    const current: Record<string, number> = {}
    for (const entry of initialData) current[entry.username] = entry.rank
    try { localStorage.setItem(LS_KEY, JSON.stringify(current)) } catch { /* ignore */ }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

    return () => { supabase.removeChannel(channel) }
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

  const top3 = data.slice(0, 3)

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-skyblue" />
            Tabla de Posiciones
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ranking general del torneo · actualizado en tiempo real.
          </p>
        </div>
        {isUpdating && (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/8 px-3 py-1.5 rounded-full border border-emerald-500/20 animate-pulse">
            <Activity className="w-3 h-3" />
            Actualizando...
          </div>
        )}
      </div>

      {/* ── Podium Top 3 ── */}
      {top3.length > 0 && (
        <div className="bg-[#071729] rounded-2xl border border-[#1E3A6E]/50 shadow-lg p-5">
          <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest text-center mb-4">
            Podio
          </p>

          {/* 2nd · 1st · 3rd — aligned at bottom so 1st looks elevated */}
          <div className="flex items-end justify-center gap-3">

            {/* 2nd — left */}
            {top3[1] ? (
              <div className="flex-1 max-w-[150px] mb-0">
                <PodiumCard entry={top3[1]} rank={2} />
              </div>
            ) : (
              <div className="flex-1 max-w-[150px]" />
            )}

            {/* 1st — center, taller due to extra padding-top */}
            <div className="flex-1 max-w-[170px] self-stretch flex flex-col justify-end">
              <PodiumCard entry={top3[0]} rank={1} large />
            </div>

            {/* 3rd — right */}
            {top3[2] ? (
              <div className="flex-1 max-w-[150px] mb-0">
                <PodiumCard entry={top3[2]} rank={3} />
              </div>
            ) : (
              <div className="flex-1 max-w-[150px]" />
            )}

          </div>
        </div>
      )}

      {/* ── Full table ── */}
      <div className="bg-[#071729] rounded-xl border border-[#1E3A6E]/50 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#030A15] border-b border-[#1E3A6E]/50 text-gray-500 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-center w-28">Pos</th>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-4 py-4 text-center">Picks</th>
                <th className="px-4 py-4 text-center">Grupos</th>
                <th className="px-4 py-4 text-center">Eliminatorias</th>
                <th className="px-4 py-4 text-center">Especiales</th>
                <th className="px-4 py-4 text-center bg-skyblue/5 text-skyblue">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3A6E]/30">
              {data.map((entry) => {
                const isMe = entry.user_id === currentUserId
                const delta = getMovement(entry.username, entry.rank, prevPositions)
                const picks = entry.predictions_count ?? 0

                return (
                  <tr
                    key={entry.user_id}
                    onClick={() => router.push(`/profile/${entry.username}`)}
                    className={`cursor-pointer transition-colors duration-150 ${
                      isMe
                        ? 'bg-skyblue/6 border-l-2 border-l-skyblue hover:bg-skyblue/10'
                        : 'hover:bg-white/4 border-l-2 border-l-transparent'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {getRankBadge(entry.rank)}
                        <MovementBadge delta={delta} />
                      </div>
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
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs font-semibold tabular-nums ${
                        picks === GROUP_MATCHES ? 'text-emerald-400' : 'text-gray-500'
                      }`}>
                        {picks}/{GROUP_MATCHES}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-gray-400 font-medium tabular-nums">
                      {entry.group_points}
                    </td>
                    <td className="px-4 py-4 text-center text-gray-400 font-medium tabular-nums">
                      {entry.knockout_points}
                    </td>
                    <td className="px-4 py-4 text-center text-gray-400 font-medium tabular-nums">
                      {entry.special_points}
                    </td>
                    <td className="px-4 py-4 text-center bg-skyblue/5">
                      <span className="text-lg font-bold text-white tabular-nums">
                        {entry.total_points}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {data.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
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
