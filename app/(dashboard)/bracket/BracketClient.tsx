'use client'

import { useState, useTransition, useCallback } from 'react'
import { Trophy, GitMerge, Loader2, Save, CheckCircle, AlertCircle, Lock } from 'lucide-react'
import type { Match, BracketPrediction, MatchPhase } from '@/types'
import { saveBracketPredictions } from './actions'
import { teamEs } from '@/lib/i18n/teams'

interface Props {
  initialMatches: Match[]
  initialPredictions: BracketPrediction[]
}

type TabKey = 'r32' | 'r16' | 'qf' | 'sf_final'

export default function BracketClient({ initialMatches, initialPredictions }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('r32')
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  // Map of match_id -> predicted_winner string
  const [predictions, setPredictions] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {}
    for (const p of initialPredictions) {
      map[p.match_id] = p.predicted_winner
    }
    return map
  })

  const isTournamentStarted = new Date() > new Date('2026-06-11T00:00:00-04:00')
  // We can also have a specific date for bracket locking, e.g. July 10, but we use tournament start for now or a custom one if specified. 
  // CLAUDE.md mentions bracket locks before the first match of 1/16, around July 8-10.
  // For safety, let's use July 8, 2026.
  const isBracketLocked = new Date() > new Date('2026-07-08T00:00:00-04:00')

  // Recursive team resolution logic
  const resolveTeam = useCallback((teamString: string): string => {
    if (!teamString) return 'TBD'
    
    // Format: 'W73' (Winner of match 73)
    if (teamString.startsWith('W')) {
      const matchNum = parseInt(teamString.substring(1), 10)
      const match = initialMatches.find((m) => m.match_number === matchNum)
      if (match && predictions[match.id]) {
        return predictions[match.id]
      }
    }
    
    // Format: 'L101' (Loser of match 101)
    if (teamString.startsWith('L')) {
      const matchNum = parseInt(teamString.substring(1), 10)
      const match = initialMatches.find((m) => m.match_number === matchNum)
      if (match && predictions[match.id]) {
        const pHome = resolveTeam(match.home_team)
        const pAway = resolveTeam(match.away_team)
        const winner = predictions[match.id]
        if (winner === pHome) return pAway
        if (winner === pAway) return pHome
      }
    }
    
    return teamString // Default to whatever is in DB
  }, [initialMatches, predictions])

  const handleSelectWinner = (matchId: number, winnerName: string) => {
    if (isBracketLocked) return
    if (!winnerName || winnerName === 'TBD' || winnerName.startsWith('W') || winnerName.startsWith('L')) {
      return // Cannot select a placeholder
    }
    setPredictions((prev) => ({ ...prev, [matchId]: winnerName }))
    setResult(null)
  }

  const handleSave = () => {
    if (isBracketLocked) return

    // Re-validate all predictions before saving to avoid saving orphans.
    const validPayload = initialMatches.map((m) => {
      const home = resolveTeam(m.home_team)
      const away = resolveTeam(m.away_team)
      const pred = predictions[m.id]
      
      if (pred && (pred === home || pred === away) && !pred.startsWith('W') && !pred.startsWith('L') && pred !== 'TBD') {
        return { match_id: m.id, predicted_winner: pred }
      }
      return null
    }).filter(Boolean) as { match_id: number; predicted_winner: string }[]

    startTransition(async () => {
      const res = await saveBracketPredictions(validPayload)
      setResult(res)
    })
  }

  // Filter matches by phase
  const matchesByPhase = {
    r32: initialMatches.filter((m) => m.phase === 'r32'),
    r16: initialMatches.filter((m) => m.phase === 'r16'),
    qf: initialMatches.filter((m) => m.phase === 'qf'),
    sf_final: initialMatches.filter((m) => ['sf', 'third', 'final'].includes(m.phase)),
  }

  const tabs: { id: TabKey; label: string; count: number }[] = [
    { id: 'r32', label: 'Dieciseisavos (1/16)', count: 16 },
    { id: 'r16', label: 'Octavos (1/8)', count: 8 },
    { id: 'qf', label: 'Cuartos (1/4)', count: 4 },
    { id: 'sf_final', label: 'Semis y Final', count: 4 },
  ]

  // Render a match card
  const renderMatchCard = (match: Match) => {
    const resolvedHome = resolveTeam(match.home_team)
    const resolvedAway = resolveTeam(match.away_team)
    const currentPred = predictions[match.id]

    // Validate if current prediction is actually valid (one of the resolved teams)
    const isPredValid = currentPred === resolvedHome || currentPred === resolvedAway
    const safePred = isPredValid ? currentPred : null

    // Determine if team buttons can be clicked
    const canSelectHome = !isBracketLocked && resolvedHome && !resolvedHome.startsWith('W') && !resolvedHome.startsWith('L') && resolvedHome !== 'TBD'
    const canSelectAway = !isBracketLocked && resolvedAway && !resolvedAway.startsWith('W') && !resolvedAway.startsWith('L') && resolvedAway !== 'TBD'

    return (
      <div key={match.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-all hover:border-skyblue/50">
        <div className="flex items-center justify-between px-3 pt-2 pb-1 bg-gray-50/50 border-b border-gray-100">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {match.phase === 'third' ? 'Tercer Puesto' : match.phase === 'final' ? 'Gran Final' : `Partido ${match.match_number}`}
          </span>
          {isBracketLocked && <Lock className="w-3 h-3 text-gray-400" />}
        </div>
        
        <div className="flex flex-col">
          {/* Home Team Button */}
          <button
            onClick={() => canSelectHome && handleSelectWinner(match.id, resolvedHome)}
            disabled={!canSelectHome}
            className={`
              flex items-center justify-between px-4 py-3 border-b border-gray-100 transition-colors
              ${safePred === resolvedHome ? 'bg-skyblue/10 text-navy font-bold' : 'bg-white text-gray-700 hover:bg-gray-50'}
              ${!canSelectHome ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
            `}
          >
            <span className="text-sm truncate">{teamEs(resolvedHome)}</span>
            {safePred === resolvedHome && <CheckCircle className="w-4 h-4 text-skyblue" />}
          </button>
          
          {/* Away Team Button */}
          <button
            onClick={() => canSelectAway && handleSelectWinner(match.id, resolvedAway)}
            disabled={!canSelectAway}
            className={`
              flex items-center justify-between px-4 py-3 transition-colors
              ${safePred === resolvedAway ? 'bg-skyblue/10 text-navy font-bold' : 'bg-white text-gray-700 hover:bg-gray-50'}
              ${!canSelectAway ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
            `}
          >
            <span className="text-sm truncate">{teamEs(resolvedAway)}</span>
            {safePred === resolvedAway && <CheckCircle className="w-4 h-4 text-skyblue" />}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <GitMerge className="w-6 h-6 text-skyblue" />
            Bracket Eliminatorio
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pronostica el camino hacia la gran final. Haz clic en el ganador de cada llave para avanzarlo.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-1 bg-gray-200/50 rounded-lg shrink-0 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-md text-sm font-semibold transition-colors whitespace-nowrap
                ${activeTab === tab.id ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-navy'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Matches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {matchesByPhase[activeTab].map(renderMatchCard)}
      </div>

      {/* Floating Save Bar */}
      <div className="fixed bottom-[80px] sm:bottom-0 left-0 right-0 sm:left-64 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex-1">
            {result ? (
              <div className={`flex items-center gap-2 text-sm font-medium ${result.success ? 'text-emerald-600' : 'text-red-600'}`}>
                {result.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {result.message}
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                {isBracketLocked ? 'El bracket se encuentra bloqueado.' : 'No olvides guardar tu bracket antes de que inicien los partidos.'}
              </p>
            )}
          </div>
          
          {!isBracketLocked && (
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center justify-center gap-2 px-6 py-2.5 w-full sm:w-auto bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy/90 transition-colors shadow-sm disabled:opacity-60"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isPending ? 'Guardando...' : 'Guardar Bracket Completo'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
