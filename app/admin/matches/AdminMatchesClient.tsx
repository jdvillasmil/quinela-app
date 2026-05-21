'use client'

import { useState, useTransition } from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'
import type { Match } from '@/types'
import { updateMatchResult } from '../actions'
import { teamEs } from '@/lib/i18n/teams'

export default function AdminMatchesClient({ initialMatches }: { initialMatches: Match[] }) {
  const [matches, setMatches] = useState<Match[]>(initialMatches)
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const [editStates, setEditStates] = useState<Record<number, { home: string, away: string }>>({})

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

  const handleSave = (matchId: number) => {
    const edit = editStates[matchId]
    if (!edit || edit.home === '' || edit.away === '') return

    const homeScore = parseInt(edit.home, 10)
    const awayScore = parseInt(edit.away, 10)

    startTransition(async () => {
      const res = await updateMatchResult(matchId, homeScore, awayScore)
      setResult(res)
      if (res.success) {
        // Update local state to reflect change
        setMatches(prev => prev.map(m => 
          m.id === matchId ? { ...m, home_score: homeScore, away_score: awayScore, status: 'finished' } : m
        ))
      }
      setTimeout(() => setResult(null), 3000)
    })
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
                       ) : (
                         <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-50 text-amber-600 px-2 py-1 rounded border border-amber-200">Pendiente</span>
                       )}
                    </td>
                    <td className="px-4 py-3 text-center">
                       <button
                         onClick={() => handleSave(m.id)}
                         disabled={isPending || !edit || edit.home === '' || edit.away === ''}
                         className="px-4 py-1.5 bg-navy text-white text-xs font-semibold rounded hover:bg-navy/90 disabled:opacity-50 transition-colors shadow-sm"
                       >
                         {isPending ? 'Guardando...' : 'Actualizar'}
                       </button>
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
