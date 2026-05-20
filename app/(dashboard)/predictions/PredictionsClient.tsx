'use client'

import { useState, useCallback, useTransition } from 'react'
import { 
  Calendar, MapPin, Lock, CheckCircle, AlertCircle, Loader2, Save,
  Trophy, Goal, Shield, Hash, AlertTriangle, Swords, Zap
} from 'lucide-react'
import type { Match, Prediction, SpecialPrediction } from '@/types'
import { saveGroupPredictions, saveSpecialPredictions, SpecialPredictionPayload } from './actions'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MatchWithPrediction extends Match {
  prediction: Pick<Prediction, 'predicted_home' | 'predicted_away'> | null
}

interface GroupData {
  [group: string]: MatchWithPrediction[]
}

interface Props {
  groupData: GroupData
  groups: string[]
  specialPrediction: SpecialPrediction | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isLocked(match: Match): boolean {
  return match.status === 'live' || match.status === 'finished'
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('es-CO', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function getStatusBadge(status: Match['status']) {
  if (status === 'live') {
    return (
      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/25 rounded-full px-2 py-0.5 uppercase tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        En vivo
      </span>
    )
  }
  if (status === 'finished') {
    return (
      <span className="text-[10px] font-semibold text-gray-400 bg-gray-400/10 border border-gray-400/20 rounded-full px-2 py-0.5 uppercase tracking-wide">
        Finalizado
      </span>
    )
  }
  return null
}

// ─── Score Input ──────────────────────────────────────────────────────────────

interface ScoreInputProps {
  value: string
  onChange: (v: string) => void
  disabled: boolean
  id: string
}

function ScoreInput({ value, onChange, disabled, id }: ScoreInputProps) {
  return (
    <input
      id={id}
      type="number"
      min={0}
      max={30}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`
        w-12 h-12 text-center text-xl font-bold rounded-lg border-2 transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-skyblue/50 focus:border-skyblue
        [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
        ${disabled
          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-white border-gray-300 text-navy hover:border-skyblue cursor-text'
        }
      `}
    />
  )
}

// ─── Match Card ───────────────────────────────────────────────────────────────

interface MatchCardProps {
  match: MatchWithPrediction
  homeScore: string
  awayScore: string
  onHomeChange: (v: string) => void
  onAwayChange: (v: string) => void
}

function MatchCard({ match, homeScore, awayScore, onHomeChange, onAwayChange }: MatchCardProps) {
  const locked = isLocked(match)

  return (
    <div className={`
      relative bg-white rounded-xl border transition-all duration-200
      ${locked
        ? 'border-gray-200 opacity-80'
        : 'border-gray-200 hover:border-skyblue/40 hover:shadow-md'
      }
    `}>
      {locked && (
        <div className="absolute top-3 right-3">
          <Lock className="w-3.5 h-3.5 text-gray-400" />
        </div>
      )}

      {/* Match number + status */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="text-[11px] font-medium text-gray-400">
          Partido #{match.match_number}
        </span>
        {getStatusBadge(match.status)}
      </div>

      {/* Teams + Scores */}
      <div className="flex items-center justify-center gap-3 px-4 py-3">
        {/* Home Team */}
        <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
          <span className="text-3xl leading-none">{match.home_flag ?? '🏳️'}</span>
          <span className="text-xs font-semibold text-navy text-center leading-tight truncate w-full">
            {match.home_team}
          </span>
        </div>

        {/* Score Inputs */}
        <div className="flex items-center gap-2 shrink-0">
          <ScoreInput
            id={`home-${match.id}`}
            value={homeScore}
            onChange={onHomeChange}
            disabled={locked}
          />
          <span className="text-lg font-bold text-gray-400 select-none">–</span>
          <ScoreInput
            id={`away-${match.id}`}
            value={awayScore}
            onChange={onAwayChange}
            disabled={locked}
          />
        </div>

        {/* Away Team */}
        <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
          <span className="text-3xl leading-none">{match.away_flag ?? '🏳️'}</span>
          <span className="text-xs font-semibold text-navy text-center leading-tight truncate w-full">
            {match.away_team}
          </span>
        </div>
      </div>

      {/* Date + Venue */}
      <div className="flex flex-col gap-1 px-4 pb-3 border-t border-gray-100 pt-2">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <Calendar className="w-3 h-3 shrink-0 text-skyblue" />
          <span>{formatDate(match.match_date)} · {formatTime(match.match_date)} (UTC-4)</span>
        </div>
        {match.venue && (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <MapPin className="w-3 h-3 shrink-0 text-skyblue" />
            <span className="truncate">{match.venue}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Group Panel ──────────────────────────────────────────────────────────────

interface GroupPanelProps {
  matches: MatchWithPrediction[]
  groupName: string
}

function GroupPanel({ matches, groupName }: GroupPanelProps) {
  // Local state: map of match_id → { home, away }
  const initialScores = () => {
    const map: Record<number, { home: string; away: string }> = {}
    for (const m of matches) {
      map[m.id] = {
        home: m.prediction?.predicted_home?.toString() ?? '',
        away: m.prediction?.predicted_away?.toString() ?? '',
      }
    }
    return map
  }

  const [scores, setScores] = useState<Record<number, { home: string; away: string }>>(initialScores)
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const setHome = useCallback((matchId: number, v: string) => {
    setScores((prev) => ({ ...prev, [matchId]: { ...prev[matchId], home: v } }))
    setResult(null)
  }, [])

  const setAway = useCallback((matchId: number, v: string) => {
    setScores((prev) => ({ ...prev, [matchId]: { ...prev[matchId], away: v } }))
    setResult(null)
  }, [])

  function handleSave() {
    const payload = matches
      .filter((m) => !isLocked(m))
      .map((m) => {
        const home = parseInt(scores[m.id]?.home ?? '', 10)
        const away = parseInt(scores[m.id]?.away ?? '', 10)
        return {
          match_id: m.id,
          predicted_home: isNaN(home) ? 0 : home,
          predicted_away: isNaN(away) ? 0 : away,
        }
      })
      .filter((p) => !isNaN(p.predicted_home) && !isNaN(p.predicted_away))

    startTransition(async () => {
      const res = await saveGroupPredictions(payload)
      setResult(res)
    })
  }

  const editableCount = matches.filter((m) => !isLocked(m)).length
  const filledCount = matches.filter((m) => {
    if (isLocked(m)) return false
    const s = scores[m.id]
    return s?.home !== '' && s?.away !== ''
  }).length

  const progress = editableCount > 0 ? Math.round((filledCount / editableCount) * 100) : 100

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-skyblue rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 shrink-0">
          {filledCount}/{editableCount} predicciones
        </span>
      </div>

      {/* Match cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            homeScore={scores[match.id]?.home ?? ''}
            awayScore={scores[match.id]?.away ?? ''}
            onHomeChange={(v) => setHome(match.id, v)}
            onAwayChange={(v) => setAway(match.id, v)}
          />
        ))}
      </div>

      {/* Save button + feedback */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        {result ? (
          <div className={`flex items-center gap-2 text-sm font-medium ${
            result.success ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {result.success
              ? <CheckCircle className="w-4 h-4" />
              : <AlertCircle className="w-4 h-4" />
            }
            {result.message}
          </div>
        ) : (
          <p className="text-xs text-gray-500">
            {editableCount > 0
              ? 'Completa todos los marcadores antes de guardar.'
              : `Todos los partidos del Grupo ${groupName} están cerrados.`
            }
          </p>
        )}

        {editableCount > 0 && (
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            {isPending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Save className="w-4 h-4" />
            }
            {isPending ? 'Guardando…' : 'Guardar Grupo'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Special Predictions Panel ────────────────────────────────────────────────

function SpecialPredictionsPanel({ initialData, locked }: { initialData: SpecialPrediction | null, locked: boolean }) {
  const [formData, setFormData] = useState<SpecialPredictionPayload>({
    top_scorer: initialData?.top_scorer ?? '',
    best_player: initialData?.best_player ?? '',
    best_keeper: initialData?.best_keeper ?? '',
    total_goals: initialData?.total_goals ?? null,
    most_red_cards: initialData?.most_red_cards ?? '',
    most_goals_match: initialData?.most_goals_match ?? '',
    fastest_goal_team: initialData?.fastest_goal_team ?? '',
  })

  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleChange = (field: keyof SpecialPredictionPayload, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setResult(null)
  }

  const handleSave = () => {
    startTransition(async () => {
      const res = await saveSpecialPredictions(formData)
      setResult(res)
    })
  }

  const fields = [
    { id: 'best_player', label: 'Balón de Oro (Mejor Jugador)', icon: Trophy, type: 'text', placeholder: 'Ej: Kylian Mbappé' },
    { id: 'top_scorer', label: 'Bota de Oro (Goleador)', icon: Goal, type: 'text', placeholder: 'Ej: Erling Haaland' },
    { id: 'best_keeper', label: 'Guante de Oro (Mejor Portero)', icon: Shield, type: 'text', placeholder: 'Ej: Dibu Martínez' },
    { id: 'total_goals', label: 'Total de goles del torneo', icon: Hash, type: 'number', placeholder: 'Ej: 170' },
    { id: 'most_red_cards', label: 'Jugador con más rojas', icon: AlertTriangle, type: 'text', placeholder: 'Ej: Pepe' },
    { id: 'most_goals_match', label: 'Partido con más goles', icon: Swords, type: 'text', placeholder: 'Ej: Brasil vs Alemania' },
    { id: 'fastest_goal_team', label: 'Equipo del gol más rápido', icon: Zap, type: 'text', placeholder: 'Ej: Francia' },
  ] as const

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {fields.map((f) => {
          const Icon = f.icon
          return (
            <div key={f.id} className="space-y-1.5">
              <label htmlFor={f.id} className="flex items-center gap-2 text-sm font-semibold text-navy">
                <Icon className="w-4 h-4 text-skyblue" />
                {f.label}
              </label>
              <input
                id={f.id}
                type={f.type}
                value={formData[f.id as keyof SpecialPredictionPayload] ?? ''}
                onChange={(e) => {
                  const val = e.target.value
                  if (f.type === 'number') {
                    handleChange(f.id as keyof SpecialPredictionPayload, val === '' ? null : parseInt(val, 10))
                  } else {
                    handleChange(f.id as keyof SpecialPredictionPayload, val)
                  }
                }}
                disabled={locked}
                placeholder={f.placeholder}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-skyblue/50
                  ${locked ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border-gray-300 text-navy hover:border-skyblue'}`}
              />
            </div>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
        {result ? (
          <div className={`flex items-center gap-2 text-sm font-medium ${result.success ? 'text-emerald-600' : 'text-red-600'}`}>
            {result.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {result.message}
          </div>
        ) : (
          <p className="text-xs text-gray-500">
            {locked ? 'El torneo ha comenzado. Ya no se pueden modificar estas predicciones.' : 'Completa todos los campos que desees predecir.'}
          </p>
        )}

        {!locked && (
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isPending ? 'Guardando…' : 'Guardar Especiales'}
          </button>
        )}
      </div>
    </div>
  )
}


// ─── Main Client Component ────────────────────────────────────────────────────

export default function PredictionsClient({ groupData, groups, specialPrediction }: Props) {
  const [activeGroup, setActiveGroup] = useState(groups[0] ?? 'A')
  const [mainTab, setMainTab] = useState<'groups' | 'special'>('groups')
  
  // Tournament start date for locking special predictions
  const tournamentStart = new Date('2026-06-11T00:00:00-04:00')
  const isTournamentStarted = new Date() > tournamentStart

  return (
    <div className="space-y-5">
      {/* Page header and Main Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Mis Predicciones</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ingresa tus pronósticos. Los campos bloqueados <Lock className="inline w-3 h-3" /> ya no admiten cambios.
          </p>
        </div>
        
        <div className="flex p-1 bg-gray-200/50 rounded-lg shrink-0">
          <button 
             onClick={() => setMainTab('groups')}
             className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${mainTab === 'groups' ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-navy'}`}
          >
            Fase de Grupos
          </button>
          <button 
             onClick={() => setMainTab('special')}
             className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${mainTab === 'special' ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-navy'}`}
          >
            Premios Especiales
          </button>
        </div>
      </div>

      {mainTab === 'groups' ? (
        <>
          {/* Group Selector Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
            <div className="flex flex-wrap gap-1">
              {groups.map((group) => (
                <button
                  key={group}
                  onClick={() => setActiveGroup(group)}
                  className={`
                    flex-1 min-w-[2.5rem] py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200
                    ${activeGroup === group
                      ? 'bg-navy text-white shadow-md'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-navy'
                    }
                  `}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          {/* Active Group Label */}
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-skyblue rounded-full" />
            <h2 className="text-base font-bold text-navy">Grupo {activeGroup}</h2>
            <span className="text-sm text-gray-400">
              · {groupData[activeGroup]?.length ?? 0} partidos
            </span>
          </div>

          {/* Group Panel */}
          {groupData[activeGroup] && (
            <GroupPanel
              key={activeGroup}
              matches={groupData[activeGroup]}
              groupName={activeGroup}
            />
          )}
        </>
      ) : (
        <SpecialPredictionsPanel initialData={specialPrediction} locked={isTournamentStarted} />
      )}
    </div>
  )
}
