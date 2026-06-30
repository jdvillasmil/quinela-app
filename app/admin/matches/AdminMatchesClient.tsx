'use client'

import { useState, useMemo } from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'
import type { Match } from '@/types'
import { updateMatchResult, setKnockoutWinner } from '../actions'
import { teamEs } from '@/lib/i18n/teams'

// Recursively resolve 'W{n}' / 'L{n}' team references to actual names
function resolveAdminTeam(teamStr: string, byNumber: Record<number, Match>): string {
  if (!teamStr.startsWith('W') && !teamStr.startsWith('L')) return teamStr
  const n = parseInt(teamStr.slice(1), 10)
  const m = byNumber[n]
  if (!m || m.status !== 'finished' || m.home_score == null || m.away_score == null) return teamStr
  if (teamStr.startsWith('W')) {
    if (m.home_score > m.away_score) return resolveAdminTeam(m.home_team, byNumber)
    if (m.away_score > m.home_score) return resolveAdminTeam(m.away_team, byNumber)
    return m.knockout_winner ? resolveAdminTeam(m.knockout_winner, byNumber) : teamStr
  }
  // L-prefix (loser)
  if (m.home_score > m.away_score) return resolveAdminTeam(m.away_team, byNumber)
  if (m.away_score > m.home_score) return resolveAdminTeam(m.home_team, byNumber)
  return teamStr
}

export default function AdminMatchesClient({ initialMatches }: { initialMatches: Match[] }) {
  const [matches, setMatches] = useState<Match[]>(initialMatches)
  const [pending, setPending] = useState<{ matchId: number; action: 'live' | 'finished' } | null>(null)
  const [pendingWinner, setPendingWinner] = useState<number | null>(null)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [editStates, setEditStates] = useState<Record<number, { home: string, away: string }>>({})
  const [knockoutWinners, setKnockoutWinners] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {}
    for (const m of initialMatches) {
      if (m.knockout_winner) map[m.id] = m.knockout_winner
    }
    return map
  })

  const matchesByNumber = useMemo(
    () => Object.fromEntries(matches.map(m => [m.match_number, m])) as Record<number, Match>,
    [matches]
  )

  const handleScoreChange = (matchId: number, side: 'home' | 'away', value: string) => {
    setEditStates(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        home: side === 'home' ? value : (prev[matchId]?.home ?? ''),
        away: side === 'away' ? value : (prev[matchId]?.away ?? '')
      }
    }))
  }

  const resolveScore = (m: Match, side: 'home' | 'away'): number | null => {
    const typed = editStates[m.id]?.[side]
    if (typed !== undefined && typed !== '') {
      const n = parseInt(typed, 10)
      return Number.isNaN(n) ? null : n
    }
    return side === 'home' ? m.home_score : m.away_score
  }

  const handleSave = async (m: Match, status: 'live' | 'finished') => {
    const home = resolveScore(m, 'home') ?? (status === 'live' ? 0 : null)
    const away = resolveScore(m, 'away') ?? (status === 'live' ? 0 : null)
    if (home === null || away === null) return

    setPending({ matchId: m.id, action: status })
    const res = await updateMatchResult(m.id, home, away, status)
    setPending(null)
    setResult(res)
    if (res.success) {
      setMatches(prev => prev.map(x =>
        x.id === m.id ? { ...x, home_score: home, away_score: away, status } : x
      ))
    }
    setTimeout(() => setResult(null), 3000)
  }

  const handleSetWinner = async (m: Match, winner: string) => {
    setPendingWinner(m.id)
    const res = await setKnockoutWinner(m.id, winner)
    setPendingWinner(null)
    setResult(res)
    if (res.success) {
      setKnockoutWinners(prev => ({ ...prev, [m.id]: winner }))
      setMatches(prev => prev.map(x => x.id === m.id ? { ...x, knockout_winner: winner } : x))
    }
    setTimeout(() => setResult(null), 3000)
  }

  return (
    <div className="space-y-6 pb-12">
      <h1 className="text-2xl font-bold text-navy">Gestión de Partidos</h1>

      {result && (
        <div className={`p-4 rounded-lg flex items-center gap-2 text-sm font-medium ${result.success ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {result.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {result.message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Fase / Grupo</th>
                <th className="px-4 py-3">Equipos y Marcador</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {matches.map((m) => {
                const edit = editStates[m.id]
                const isRowPending = pending?.matchId === m.id
                const anyPending = pending !== null
                const hasScore = resolveScore(m, 'home') !== null && resolveScore(m, 'away') !== null

                const isKnockout = m.phase !== 'groups'
                const isDraw = m.status === 'finished' &&
                  m.home_score !== null && m.away_score !== null &&
                  m.home_score === m.away_score
                const needsWinner = isKnockout && isDraw

                const currentWinner = knockoutWinners[m.id] ?? null

                return (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500">{m.match_number}</td>
                    <td className="px-4 py-3">
                      {m.phase === 'groups' ? `Grupo ${m.group_name}` : m.phase.toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-24 text-right font-medium">{teamEs(m.home_team)}</span>
                        <input
                          type="number"
                          min={0}
                          value={edit?.home ?? (m.home_score ?? '')}
                          onChange={(e) => handleScoreChange(m.id, 'home', e.target.value)}
                          className="w-12 h-8 text-center border border-gray-300 rounded focus:border-skyblue focus:ring-1 focus:ring-skyblue outline-none"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                          type="number"
                          min={0}
                          value={edit?.away ?? (m.away_score ?? '')}
                          onChange={(e) => handleScoreChange(m.id, 'away', e.target.value)}
                          className="w-12 h-8 text-center border border-gray-300 rounded focus:border-skyblue focus:ring-1 focus:ring-skyblue outline-none"
                        />
                        <span className="w-24 font-medium">{teamEs(m.away_team)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                       {m.status === 'finished' ? (
                         <span className="text-[10px] uppercase font-bold tracking-wider bg-gray-100 text-gray-600 px-2 py-1 rounded">Finalizado</span>
                       ) : m.status === 'live' ? (
                         <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider bg-red-50 text-red-600 px-2 py-1 rounded border border-red-200">
                           <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                           En Vivo
                         </span>
                       ) : (
                         <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-50 text-amber-600 px-2 py-1 rounded border border-amber-200">Pendiente</span>
                       )}
                    </td>
                    <td className="px-4 py-3 text-center">
                       <div className="inline-flex flex-col items-center gap-2">
                         <div className="inline-flex items-center gap-2">
                           {m.status !== 'finished' && (
                             <button
                               onClick={() => handleSave(m, 'live')}
                               disabled={anyPending}
                               className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
                             >
                               {isRowPending && pending.action === 'live'
                                 ? 'Guardando...'
                                 : m.status === 'live' ? 'Actualizar marcador' : '● En Vivo'}
                             </button>
                           )}
                           <button
                             onClick={() => handleSave(m, 'finished')}
                             disabled={anyPending || !hasScore}
                             className="px-3 py-1.5 bg-navy text-white text-xs font-semibold rounded hover:bg-navy/90 disabled:opacity-50 transition-colors shadow-sm"
                           >
                             {isRowPending && pending.action === 'finished'
                               ? 'Guardando...'
                               : m.status === 'finished' ? 'Corregir final' : 'Finalizar'}
                           </button>
                         </div>

                         {needsWinner && (
                           <div className="flex flex-col items-center gap-1">
                             <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">¿Quién avanzó?</span>
                             <div className="flex gap-1">
                               {([m.home_team, m.away_team] as const).map(raw => {
                                 const display = teamEs(resolveAdminTeam(raw, matchesByNumber))
                                 const isSelected = currentWinner === raw
                                 return (
                                   <button
                                     key={raw}
                                     onClick={() => handleSetWinner(m, raw)}
                                     disabled={pendingWinner === m.id}
                                     className={`px-2 py-1 text-[11px] font-semibold rounded border transition-colors disabled:opacity-50 ${
                                       isSelected
                                         ? 'bg-navy text-white border-navy'
                                         : 'bg-white text-gray-700 border-gray-300 hover:border-navy hover:text-navy'
                                     }`}
                                   >
                                     {pendingWinner === m.id ? '...' : display}
                                   </button>
                                 )
                               })}
                             </div>
                           </div>
                         )}
                       </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
