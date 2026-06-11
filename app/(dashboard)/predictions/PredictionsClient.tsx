'use client'

import { useState, useCallback, useTransition, useMemo } from 'react'
import {
  Calendar, MapPin, Lock, CheckCircle, AlertCircle, Loader2, Save,
  Trophy, Goal, Shield, Hash, Zap, Printer
} from 'lucide-react'
import type { Match, Prediction, SpecialPrediction } from '@/types'
import { saveGroupPredictions, saveGroupStandings, saveSpecialPredictions, SpecialPredictionPayload } from './actions'
import { teamEs } from '@/lib/i18n/teams'
import TeamFlag from '@/components/ui/TeamFlag'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MatchWithPrediction extends Match {
  prediction: Pick<Prediction, 'predicted_home' | 'predicted_away'> | null
}

interface GroupData {
  [group: string]: MatchWithPrediction[]
}

interface PredictionStatRow {
  predicted_home: number
  predicted_away: number
  prediction_count: number
}

interface MatchStatsData {
  stats: PredictionStatRow[]
  total: number
}

interface Props {
  groupData: GroupData
  groups: string[]
  specialPrediction: SpecialPrediction | null
  groupStandingsData: Record<string, { first_place: string; second_place: string } | null>
  username: string
  matchPredictionStats: Record<number, MatchStatsData>
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
      <span className="text-[10px] font-semibold text-gray-500 bg-gray-500/10 border border-gray-500/20 rounded-full px-2 py-0.5 uppercase tracking-wide">
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
          ? 'bg-[#020B18]/60 border-[#1E3A6E]/30 text-gray-600 cursor-not-allowed'
          : 'bg-[#020B18] border-[#1E3A6E] text-white hover:border-skyblue/60 cursor-text'
        }
      `}
    />
  )
}

// ─── Prediction Stats (locked matches) ────────────────────────────────────────

function MatchPredictionStatsView({ data }: { data: MatchStatsData }) {
  if (data.total === 0) return null
  const top = data.stats.slice(0, 3)
  return (
    <div className="px-4 pb-3 border-t border-white/6 pt-2.5 space-y-1.5">
      <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
        Pronósticos · {data.total} {data.total === 1 ? 'participante' : 'participantes'}
      </p>
      {top.map((s) => {
        const pct = Math.round((Number(s.prediction_count) / data.total) * 100)
        return (
          <div key={`${s.predicted_home}-${s.predicted_away}`} className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-300 w-7 text-center shrink-0 tabular-nums">
              {s.predicted_home}–{s.predicted_away}
            </span>
            <div className="flex-1 bg-white/8 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-skyblue/50 rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-500 w-7 text-right shrink-0 tabular-nums">
              {pct}%
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Match Card ───────────────────────────────────────────────────────────────

interface MatchCardProps {
  match: MatchWithPrediction
  homeScore: string
  awayScore: string
  onHomeChange: (v: string) => void
  onAwayChange: (v: string) => void
  matchStats?: MatchStatsData
}

function MatchCard({ match, homeScore, awayScore, onHomeChange, onAwayChange, matchStats }: MatchCardProps) {
  const locked = isLocked(match)

  return (
    <div className={`
      relative bg-[#071729] rounded-xl border transition-all duration-200
      ${locked
        ? 'border-[#1E3A6E]/30 opacity-70'
        : 'border-[#1E3A6E]/50 hover:border-skyblue/40 hover:shadow-lg hover:shadow-skyblue/5'
      }
    `}>
      {locked && (
        <div className="absolute top-3 right-3">
          <Lock className="w-3.5 h-3.5 text-gray-600" />
        </div>
      )}

      {/* Match number + status */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="text-[11px] font-medium text-gray-600">
          Partido #{match.match_number}
        </span>
        {getStatusBadge(match.status)}
      </div>

      {/* Teams + Scores */}
      <div className="flex items-center justify-center gap-3 px-4 py-3">
        {/* Home Team */}
        <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
          <TeamFlag team={match.home_team} size="lg" className="rounded-sm" />
          <span className="text-xs font-semibold text-gray-200 text-center leading-tight truncate w-full">
            {teamEs(match.home_team)}
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
          <span className="text-lg font-bold text-gray-700 select-none">–</span>
          <ScoreInput
            id={`away-${match.id}`}
            value={awayScore}
            onChange={onAwayChange}
            disabled={locked}
          />
        </div>

        {/* Away Team */}
        <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
          <TeamFlag team={match.away_team} size="lg" className="rounded-sm" />
          <span className="text-xs font-semibold text-gray-200 text-center leading-tight truncate w-full">
            {teamEs(match.away_team)}
          </span>
        </div>
      </div>

      {/* Date + Venue */}
      <div className="flex flex-col gap-1 px-4 pb-3 border-t border-white/6 pt-2">
        <div className="flex items-center gap-1.5 text-[12px] text-[#9CA3AF]">
          <Calendar className="w-3 h-3 shrink-0 text-skyblue/60" />
          <span>{formatDate(match.match_date)} · {formatTime(match.match_date)} (UTC-4)</span>
        </div>
        {match.venue && (
          <div className="flex items-center gap-1.5 text-[12px] text-[#9CA3AF]">
            <MapPin className="w-3 h-3 shrink-0 text-skyblue/60" />
            <span className="truncate">{match.venue}</span>
          </div>
        )}
      </div>

      {/* Aggregated prediction stats (locked matches only) */}
      {locked && matchStats && <MatchPredictionStatsView data={matchStats} />}
    </div>
  )
}

// ─── Group Standings ──────────────────────────────────────────────────────────

interface TeamStats {
  team: string
  flag: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

function computeGroupStandings(
  matches: MatchWithPrediction[],
  scores: Record<number, { home: string; away: string }>
): TeamStats[] {
  const flagMap: Record<string, string> = {}
  for (const m of matches) {
    flagMap[m.home_team] = m.home_flag ?? '🏳️'
    flagMap[m.away_team] = m.away_flag ?? '🏳️'
  }

  const stats: Record<string, TeamStats> = {}
  for (const team of Object.keys(flagMap)) {
    stats[team] = { team, flag: flagMap[team], played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
  }

  for (const m of matches) {
    const s = scores[m.id]
    const h = parseInt(s?.home ?? '', 10)
    const a = parseInt(s?.away ?? '', 10)
    if (isNaN(h) || isNaN(a)) continue

    stats[m.home_team].played++
    stats[m.away_team].played++
    stats[m.home_team].goalsFor += h
    stats[m.home_team].goalsAgainst += a
    stats[m.away_team].goalsFor += a
    stats[m.away_team].goalsAgainst += h

    if (h > a) {
      stats[m.home_team].won++
      stats[m.home_team].points += 3
      stats[m.away_team].lost++
    } else if (h < a) {
      stats[m.away_team].won++
      stats[m.away_team].points += 3
      stats[m.home_team].lost++
    } else {
      stats[m.home_team].drawn++
      stats[m.home_team].points++
      stats[m.away_team].drawn++
      stats[m.away_team].points++
    }
  }

  return Object.values(stats).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    const gdA = a.goalsFor - a.goalsAgainst
    const gdB = b.goalsFor - b.goalsAgainst
    if (gdB !== gdA) return gdB - gdA
    return b.goalsFor - a.goalsFor
  })
}

// ─── Group Panel ──────────────────────────────────────────────────────────────

interface GroupPanelProps {
  matches: MatchWithPrediction[]
  groupName: string
  initialStandings: { first_place: string; second_place: string } | null
  matchPredictionStats: Record<number, MatchStatsData>
}

function GroupPanel({ matches, groupName, matchPredictionStats }: GroupPanelProps) {
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

  const standings = useMemo(() => computeGroupStandings(matches, scores), [matches, scores])

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

    const first = standings[0]?.team ?? ''
    const second = standings[1]?.team ?? ''

    startTransition(async () => {
      const scoresRes = await saveGroupPredictions(payload)
      if (!scoresRes.success) {
        setResult(scoresRes)
        return
      }
      if (first && second) {
        const standingsRes = await saveGroupStandings({ group_name: groupName, first_place: first, second_place: second })
        setResult({
          success: standingsRes.success,
          message: standingsRes.success
            ? 'Predicciones guardadas correctamente.'
            : standingsRes.message,
        })
      } else {
        setResult(scoresRes)
      }
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
        <div className="flex-1 bg-white/8 rounded-full h-1.5 overflow-hidden">
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
            matchStats={matchPredictionStats[match.id]}
          />
        ))}
      </div>

      {/* Live group standings table */}
      <div className="rounded-xl border border-[#1E3A6E]/60 overflow-hidden">
        <div className="px-4 py-2.5 bg-[#0A1E35] flex items-center justify-between">
          <p className="text-xs font-semibold text-skyblue uppercase tracking-wide">
            Clasificación · Grupo {groupName}
          </p>
          <span className="text-[10px] text-gray-500">Se actualiza con tus marcadores</span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#1E3A6E]/40 bg-[#071729]">
              <th className="px-3 py-2 text-left text-gray-500 font-medium w-6">#</th>
              <th className="px-3 py-2 text-left text-gray-500 font-medium">Equipo</th>
              <th className="px-2 py-2 text-center text-gray-500 font-medium w-7" title="Partidos jugados">PJ</th>
              <th className="px-2 py-2 text-center text-gray-500 font-medium w-7" title="Ganados">G</th>
              <th className="px-2 py-2 text-center text-gray-500 font-medium w-7" title="Empatados">E</th>
              <th className="px-2 py-2 text-center text-gray-500 font-medium w-7" title="Perdidos">P</th>
              <th className="px-2 py-2 text-center text-gray-500 font-medium w-7" title="Goles a favor">GF</th>
              <th className="px-2 py-2 text-center text-gray-500 font-medium w-7" title="Goles en contra">GC</th>
              <th className="px-2 py-2 text-center text-gray-500 font-medium w-8" title="Diferencia de goles">DG</th>
              <th className="px-3 py-2 text-center text-skyblue font-bold w-8">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => {
              const gd = s.goalsFor - s.goalsAgainst
              return (
                <tr
                  key={s.team}
                  className={`border-b border-[#1E3A6E]/20 last:border-0 transition-colors ${i < 2 ? 'bg-skyblue/5' : 'bg-[#071729]'}`}
                >
                  <td className="px-3 py-2.5 text-center font-bold">
                    {i === 0 ? <span className="text-yellow-400">1</span>
                      : i === 1 ? <span className="text-gray-300">2</span>
                      : <span className="text-gray-600">{i + 1}</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      {i < 2 && <div className="w-0.5 h-4 bg-skyblue rounded-full" />}
                      <TeamFlag team={s.team} size="sm" className="rounded-sm" />
                      <span className={i < 2 ? 'text-white font-semibold' : 'text-gray-400'}>{teamEs(s.team)}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-center text-gray-400">{s.played}</td>
                  <td className="px-2 py-2.5 text-center text-gray-400">{s.won}</td>
                  <td className="px-2 py-2.5 text-center text-gray-400">{s.drawn}</td>
                  <td className="px-2 py-2.5 text-center text-gray-400">{s.lost}</td>
                  <td className="px-2 py-2.5 text-center text-gray-400">{s.goalsFor}</td>
                  <td className="px-2 py-2.5 text-center text-gray-400">{s.goalsAgainst}</td>
                  <td className={`px-2 py-2.5 text-center font-medium ${gd > 0 ? 'text-emerald-400' : gd < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {gd > 0 ? `+${gd}` : gd}
                  </td>
                  <td className="px-3 py-2.5 text-center font-bold text-skyblue">{s.points}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Save button + feedback */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        {result ? (
          <div className={`flex items-center gap-2 text-sm font-medium ${
            result.success ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {result.success
              ? <CheckCircle className="w-4 h-4" />
              : <AlertCircle className="w-4 h-4" />
            }
            {result.message}
          </div>
        ) : (
          <p className="text-xs text-gray-500">
            {editableCount === 0
              ? `Todos los partidos del Grupo ${groupName} están cerrados.`
              : filledCount < editableCount
                ? 'Completa todos los marcadores antes de guardar.'
                : null
            }
          </p>
        )}

        {editableCount > 0 && (
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-skyblue text-navy text-sm font-bold rounded-lg hover:bg-skyblue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm cursor-pointer"
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
    { id: 'fastest_goal_team', label: 'Equipo del gol más rápido', icon: Zap, type: 'text', placeholder: 'Ej: Francia' },
  ] as const

  return (
    <div className="bg-[#071729] rounded-xl border border-[#1E3A6E]/50 p-5 shadow-lg space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {fields.map((f) => {
          const Icon = f.icon
          return (
            <div key={f.id} className="space-y-1.5">
              <label htmlFor={f.id} className="flex items-center gap-2 text-sm font-semibold text-gray-200">
                <Icon className="w-4 h-4 text-skyblue" />
                {f.label}
              </label>
              <input
                id={f.id}
                type={f.type}
                min={f.type === 'number' ? 0 : undefined}
                max={f.type === 'number' ? 500 : undefined}
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
                  ${locked
                    ? 'bg-[#020B18]/60 border-[#1E3A6E]/30 text-gray-600 cursor-not-allowed placeholder:text-gray-700'
                    : 'bg-[#020B18] border-[#1E3A6E] text-white hover:border-skyblue/60 placeholder:text-gray-600'}`}
              />
            </div>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/8">
        {result ? (
          <div className={`flex items-center gap-2 text-sm font-medium ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
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
            className="flex items-center gap-2 px-5 py-2.5 bg-skyblue text-navy text-sm font-bold rounded-lg hover:bg-skyblue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm cursor-pointer"
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

export default function PredictionsClient({ groupData, groups, specialPrediction, groupStandingsData, username, matchPredictionStats }: Props) {
  const [activeGroup, setActiveGroup] = useState(groups[0] ?? 'A')
  const [mainTab, setMainTab] = useState<'groups' | 'special'>('groups')
  const [isPrinting, setIsPrinting] = useState(false)

  const tournamentStart = new Date('2026-06-11T00:00:00-04:00')
  const isTournamentStarted = new Date() > tournamentStart

  const savedPredictionsCount = useMemo(
    () => groups.reduce((total, g) => total + groupData[g].filter((m) => m.prediction !== null).length, 0),
    [groupData, groups],
  )
  const canPrint = savedPredictionsCount === 72

  async function handlePrint() {
    if (!canPrint || isPrinting) return
    setIsPrinting(true)
    try {
      const { generatePicksPdf } = await import('@/lib/pdf/generatePicksPdf')
      generatePicksPdf(groupData, groups, specialPrediction, username)
    } catch (err) {
      console.error('Error generando PDF:', err)
    } finally {
      setIsPrinting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Page header and Main Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Mis Predicciones</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ingresa tus pronósticos. Los campos bloqueados <Lock className="inline w-3 h-3" /> ya no admiten cambios.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Print picks button */}
          <button
            onClick={handlePrint}
            disabled={!canPrint || isPrinting}
            title={canPrint ? 'Descargar PDF con todas tus predicciones' : `${savedPredictionsCount}/72 partidos guardados`}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-semibold rounded-lg border transition-all duration-200
              ${canPrint && !isPrinting
                ? 'border-skyblue/40 text-skyblue hover:bg-skyblue/10 cursor-pointer'
                : 'border-white/10 text-gray-600 cursor-not-allowed opacity-50'
              }`}
          >
            {isPrinting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Printer className="w-4 h-4" />
            }
            <span className="hidden sm:inline">
              {isPrinting ? 'Generando…' : canPrint ? 'Imprimir mis picks' : `${savedPredictionsCount}/72`}
            </span>
          </button>

          {/* Tab switcher */}
          <div className="flex p-1 bg-[#020B18] rounded-lg border border-[#1E3A6E]/40">
            <button
              onClick={() => setMainTab('groups')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-150 cursor-pointer ${
                mainTab === 'groups'
                  ? 'bg-[#071729] text-white shadow-sm border border-[#1E3A6E]/50'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Fase de Grupos
            </button>
            <button
              onClick={() => setMainTab('special')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-150 cursor-pointer ${
                mainTab === 'special'
                  ? 'bg-[#071729] text-white shadow-sm border border-[#1E3A6E]/50'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Premios Especiales
            </button>
          </div>
        </div>
      </div>

      {mainTab === 'groups' ? (
        <>
          {/* Premios Especiales banner */}
          <button
            onClick={() => setMainTab('special')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-skyblue/40 bg-skyblue/10 hover:bg-skyblue/15 transition-all duration-200 cursor-pointer group"
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-skyblue opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-skyblue" />
            </span>
            <span className="flex-1 text-left text-sm font-semibold text-skyblue">
              ¡No olvides tus Premios Especiales!
            </span>
            <span className="text-xs font-medium text-skyblue/70 group-hover:text-skyblue transition-colors">
              Ir ahora →
            </span>
          </button>

          {/* Group Selector Tabs */}
          <div className="bg-[#020B18] rounded-xl border border-[#1E3A6E]/40 p-1">
            <div className="flex flex-wrap gap-1">
              {groups.map((group) => (
                <button
                  key={group}
                  onClick={() => setActiveGroup(group)}
                  className={`
                    flex-1 min-w-[2.5rem] py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer
                    ${activeGroup === group
                      ? 'bg-navy text-white shadow-md'
                      : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
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
            <h2 className="text-base font-bold text-white">Grupo {activeGroup}</h2>
            <span className="text-sm text-gray-500">
              · {groupData[activeGroup]?.length ?? 0} partidos
            </span>
          </div>

          {/* Group Panel */}
          {groupData[activeGroup] && (
            <GroupPanel
              key={activeGroup}
              matches={groupData[activeGroup]}
              groupName={activeGroup}
              initialStandings={groupStandingsData[activeGroup] ?? null}
              matchPredictionStats={matchPredictionStats}
            />
          )}
        </>
      ) : (
        <SpecialPredictionsPanel initialData={specialPrediction} locked={isTournamentStarted} />
      )}
    </div>
  )
}
