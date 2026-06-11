'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, Target, ChevronRight, Star, CalendarDays, ChevronDown, LayoutGrid } from 'lucide-react'
import type { LeaderboardEntry } from '@/types'
import type { NextMatch, GroupStanding } from './page'
import { teamEs } from '@/lib/i18n/teams'
import TeamFlag from '@/components/ui/TeamFlag'

interface Props {
  firstName: string
  entry: LeaderboardEntry | null
  totalUsers: number
  predictionsCount: number
  nextMatches: NextMatch[]
  groupStandings: GroupStanding[]
}

function formatMatchDate(dateStr: string): { day: string; time: string } {
  const d = new Date(dateStr)
  const day = d.toLocaleDateString('es-CO', {
    timeZone: 'America/Caracas',
    day: '2-digit',
    month: 'short',
  })
  const time = d.toLocaleTimeString('es-CO', {
    timeZone: 'America/Caracas',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  return { day, time }
}

const TOURNAMENT_START = new Date('2026-06-11T19:00:00Z') // 15:00 Bogotá (UTC-4)
const GROUP_MATCHES = 72

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  started: boolean
}

function getTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now())
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    started: diff <= 0,
  }
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black/20 border border-white/15 rounded-xl flex items-center justify-center shadow-inner">
        <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-skyblue/70 text-[10px] font-semibold mt-2 uppercase tracking-widest">
        {label}
      </span>
    </div>
  )
}

function TimeSeparator() {
  return <span className="text-white/25 text-2xl font-light self-start mt-5">:</span>
}

// ─── Mis Grupos ───────────────────────────────────────────────────────────────

function GroupTable({ standing }: { standing: GroupStanding }) {
  return (
    <div className="rounded-xl border border-[#1E3A6E]/60 overflow-hidden">
      <div className="px-4 py-2.5 bg-[#0A1E35] flex items-center justify-between">
        <p className="text-xs font-semibold text-skyblue uppercase tracking-wide">
          Grupo {standing.groupName}
        </p>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#1E3A6E]/40 bg-[#071729]">
            <th className="px-3 py-2 text-left text-gray-500 font-medium w-6">#</th>
            <th className="px-3 py-2 text-left text-gray-500 font-medium">Equipo</th>
            <th className="px-2 py-2 text-center text-gray-500 font-medium w-8" title="Puntos">Pts</th>
            <th className="px-2 py-2 text-center text-gray-500 font-medium w-8" title="Goles a favor">GF</th>
            <th className="px-2 py-2 text-center text-gray-500 font-medium w-8" title="Goles en contra">GC</th>
            <th className="px-2 py-2 text-center text-gray-500 font-medium w-8" title="Diferencia de goles">DG</th>
          </tr>
        </thead>
        <tbody>
          {standing.teams.map((t, i) => {
            const gd = t.goalsFor - t.goalsAgainst
            const isQualified = i < 2
            return (
              <tr
                key={t.team}
                className={`border-b border-[#1E3A6E]/20 last:border-0 transition-colors ${isQualified ? 'bg-skyblue/5' : 'bg-[#071729]'}`}
              >
                <td className="px-3 py-2.5 text-center font-bold">
                  {i === 0 ? <span className="text-yellow-400">1</span>
                    : i === 1 ? <span className="text-gray-300">2</span>
                    : <span className="text-gray-600">{i + 1}</span>}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    {isQualified && <div className="w-0.5 h-4 bg-skyblue rounded-full shrink-0" />}
                    <TeamFlag team={t.team} size="sm" className="rounded-sm" />
                    <span className={`truncate ${isQualified ? 'text-white font-semibold' : 'text-gray-400'}`}>
                      {teamEs(t.team)}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-2.5 text-center font-bold text-skyblue">{t.points}</td>
                <td className="px-2 py-2.5 text-center text-gray-400">{t.goalsFor}</td>
                <td className="px-2 py-2.5 text-center text-gray-400">{t.goalsAgainst}</td>
                <td className={`px-2 py-2.5 text-center font-medium ${gd > 0 ? 'text-emerald-400' : gd < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {gd > 0 ? `+${gd}` : gd}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function MisGrupos({ groupStandings }: { groupStandings: GroupStanding[] }) {
  const [selected, setSelected] = useState(groupStandings[0]?.groupName ?? 'A')

  const idx = groupStandings.findIndex((g) => g.groupName === selected)
  const visible = groupStandings.slice(idx, idx + 2)

  if (groupStandings.length === 0) {
    return (
      <div className="bg-[#071729] rounded-2xl border border-[#1E3A6E]/50 shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <LayoutGrid className="w-4 h-4 text-skyblue" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Mis Grupos</h2>
        </div>
        <p className="text-sm text-gray-500 text-center py-4">
          Completa tus predicciones para ver tus grupos
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#071729] rounded-2xl border border-[#1E3A6E]/50 shadow-lg overflow-hidden">
      {/* Header + selector */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/6">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-skyblue" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Mis Grupos</h2>
        </div>
        <div className="flex flex-wrap gap-1">
          {groupStandings.map((g) => (
            <button
              key={g.groupName}
              onClick={() => setSelected(g.groupName)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                selected === g.groupName
                  ? 'bg-skyblue text-navy shadow-sm'
                  : 'text-gray-500 hover:bg-white/8 hover:text-gray-200'
              }`}
            >
              {g.groupName}
            </button>
          ))}
        </div>
      </div>

      {/* Tables — 2-col desktop, 1-col mobile */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visible.map((g) => (
          <GroupTable key={g.groupName} standing={g} />
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function DashboardClient({ firstName, entry, totalUsers, predictionsCount, nextMatches, groupStandings }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [rulesOpen, setRulesOpen] = useState(false)

  useEffect(() => {
    const update = () => setTimeLeft(getTimeLeft(TOURNAMENT_START))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const progress = Math.round((predictionsCount / GROUP_MATCHES) * 100)
  const points = entry?.total_points ?? 0
  const rank = entry?.rank ?? null
  const remaining = GROUP_MATCHES - predictionsCount

  return (
    <div className="space-y-5 max-w-3xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">
          {firstName ? `Hola, ${firstName}` : 'Bienvenido'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Quiniela Mundial USA · MEX · CAN 2026 · Proyelec International
        </p>
      </div>

      {/* Countdown — two-column card */}
      <div className="relative bg-navy rounded-2xl overflow-hidden shadow-lg shadow-black/30 border border-[#1E3A6E]/60">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-skyblue/6" />
          <div className="absolute -bottom-12 -left-12 w-60 h-60 rounded-full bg-skyblue/4" />
        </div>

        <div className="relative flex flex-col sm:flex-row">
          {/* Left: timer */}
          <div className="flex-1 p-6 sm:p-8">
            <p className="text-skyblue text-xs font-semibold uppercase tracking-widest mb-0.5">
              {timeLeft?.started ? 'El torneo está en curso' : 'El torneo comienza en'}
            </p>
            <p className="text-white/35 text-xs mb-6">
              11 jun 2026 · 15:00 h (UTC-4)
            </p>

            {timeLeft === null ? (
              <div className="flex gap-3 sm:gap-4">
                {['--', '--', '--', '--'].map((v, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-16 h-16 sm:w-[4.25rem] sm:h-[4.25rem] bg-black/20 border border-white/10 rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-bold text-white/20 tabular-nums">{v}</span>
                    </div>
                    <span className="text-white/10 text-[10px] font-semibold mt-2 uppercase tracking-widest">···</span>
                  </div>
                ))}
              </div>
            ) : timeLeft.started ? (
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-2xl font-bold text-white">¡El Mundial está en curso!</p>
              </div>
            ) : (
              <div className="flex items-start gap-2 sm:gap-3">
                <TimeUnit value={timeLeft.days} label="Días" />
                <TimeSeparator />
                <TimeUnit value={timeLeft.hours} label="Horas" />
                <TimeSeparator />
                <TimeUnit value={timeLeft.minutes} label="Min" />
                <TimeSeparator />
                <TimeUnit value={timeLeft.seconds} label="Seg" />
              </div>
            )}
          </div>

          {/* Divider */}
          {nextMatches.length > 0 && (
            <>
              <div className="hidden sm:block w-px bg-white/8 my-6 flex-shrink-0" />
              <div className="sm:hidden h-px bg-white/8 mx-6" />
            </>
          )}

          {/* Right: próximo partido */}
          {nextMatches.length > 0 && (() => {
            const match = nextMatches[0]
            const { day, time } = formatMatchDate(match.match_date)
            return (
              <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
                <p className="text-skyblue text-xs font-semibold uppercase tracking-widest mb-4">
                  Próximo partido
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2.5">
                    <TeamFlag team={match.home_team} size="md" className="rounded-sm" />
                    <span className="text-sm font-semibold text-white">{teamEs(match.home_team)}</span>
                  </div>
                  <span className="block text-xs text-gray-600 pl-0.5">vs</span>
                  <div className="flex items-center gap-2.5">
                    <TeamFlag team={match.away_team} size="md" className="rounded-sm" />
                    <span className="text-sm font-semibold text-white">{teamEs(match.away_team)}</span>
                  </div>
                </div>
                <p className="text-xs text-skyblue tabular-nums">
                  {time} <span className="text-skyblue/50">UTC-4</span>
                  <span className="text-gray-600"> · </span>
                  <span className="text-gray-500 capitalize">{day}</span>
                </p>
                {match.venue && (
                  <p className="text-[11px] text-gray-600 mt-1 truncate">{match.venue}</p>
                )}
                {match.group_name && (
                  <span className="inline-block mt-3 text-[10px] font-semibold text-skyblue/60 bg-skyblue/8 border border-skyblue/15 rounded-md px-2 py-0.5 uppercase tracking-wide w-fit">
                    Grupo {match.group_name}
                  </span>
                )}
              </div>
            )
          })()}
        </div>
      </div>

      {/* Próximos partidos (2° y 3° en adelante) */}
      {nextMatches.length > 1 && (
        <div className="bg-[#071729] rounded-2xl border border-[#1E3A6E]/50 shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/6">
            <CalendarDays className="w-4 h-4 text-skyblue" />
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Próximos partidos
            </span>
          </div>
          <ul className="divide-y divide-white/5">
            {nextMatches.slice(1).map((match) => {
              const { day, time } = formatMatchDate(match.match_date)
              return (
                <li key={match.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-20 flex-shrink-0">
                    <p className="text-[11px] text-skyblue font-semibold tabular-nums">{time} <span className="text-skyblue/50">UTC-4</span></p>
                    <p className="text-[11px] text-gray-500 capitalize mt-0.5">{day}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <TeamFlag team={match.home_team} size="sm" className="rounded-sm" />
                      <span className="truncate">{teamEs(match.home_team)}</span>
                      <span className="text-gray-600 text-xs font-normal flex-shrink-0">vs</span>
                      <TeamFlag team={match.away_team} size="sm" className="rounded-sm" />
                      <span className="truncate">{teamEs(match.away_team)}</span>
                    </div>
                    {match.venue && (
                      <p className="text-[11px] text-gray-600 mt-0.5 truncate">{match.venue}</p>
                    )}
                  </div>
                  {match.group_name && (
                    <span className="flex-shrink-0 text-[10px] font-semibold text-skyblue/60 bg-skyblue/8 border border-skyblue/15 rounded-md px-2 py-0.5 uppercase tracking-wide">
                      Gr. {match.group_name}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Points */}
        <div className="bg-[#071729] rounded-xl border border-[#1E3A6E]/50 shadow-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-skyblue/10 flex items-center justify-center">
              <Star className="w-4 h-4 text-skyblue" />
            </div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Mis puntos
            </span>
          </div>
          <p className="text-4xl font-bold text-white tabular-nums">{points}</p>
          <div className="mt-4 space-y-1.5 text-xs border-t border-white/8 pt-3">
            <div className="flex justify-between text-gray-500">
              <span>Grupos</span>
              <span className="font-semibold text-gray-300">{entry?.group_points ?? 0} pts</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Eliminatorias</span>
              <span className="font-semibold text-gray-300">{entry?.knockout_points ?? 0} pts</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Especiales</span>
              <span className="font-semibold text-gray-300">{entry?.special_points ?? 0} pts</span>
            </div>
          </div>
        </div>

        {/* Ranking */}
        <div className="bg-[#071729] rounded-xl border border-[#1E3A6E]/50 shadow-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-skyblue/10 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-skyblue" />
            </div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Posición
            </span>
          </div>
          {rank !== null ? (
            <>
              <p className="text-4xl font-bold text-white tabular-nums">#{rank}</p>
              <p className="text-xs text-gray-500 mt-2">
                de{' '}
                <span className="font-semibold text-gray-300">{totalUsers}</span>{' '}
                participante{totalUsers !== 1 ? 's' : ''}
              </p>
              {rank === 1 && (
                <p className="text-xs text-amber-400 font-semibold mt-2">Líder del torneo</p>
              )}
              {rank === 2 && (
                <p className="text-xs text-gray-400 font-semibold mt-2">2° lugar</p>
              )}
              {rank === 3 && (
                <p className="text-xs text-orange-400 font-semibold mt-2">3er lugar</p>
              )}
            </>
          ) : (
            <>
              <p className="text-4xl font-bold text-gray-700">—</p>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Haz predicciones para aparecer en el ranking
              </p>
            </>
          )}
        </div>

        {/* Progress */}
        <div className="bg-[#071729] rounded-xl border border-[#1E3A6E]/50 shadow-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-skyblue/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-skyblue" />
            </div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Progreso
            </span>
          </div>
          <div className="flex items-end gap-1.5">
            <p className="text-4xl font-bold text-white tabular-nums">{predictionsCount}</p>
            <p className="text-lg text-gray-600 font-normal mb-0.5">/ {GROUP_MATCHES}</p>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">partidos predichos</p>
          <div className="mt-4">
            <div className="h-2 bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-skyblue rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-gray-500">{progress}% completo</span>
              {progress === 100 && (
                <span className="text-xs font-semibold text-emerald-400">Completo</span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Giant CTA */}
      <Link
        href="/predictions"
        className="group flex items-center justify-between w-full bg-navy hover:bg-[#001a4d] border border-[#1E3A6E]/60 hover:border-skyblue/40 transition-all duration-200 rounded-2xl p-6 sm:p-8 text-white shadow-lg hover:shadow-xl hover:shadow-skyblue/5 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
      >
        <div>
          <p className="text-skyblue text-xs font-semibold uppercase tracking-widest mb-1.5">
            {predictionsCount === GROUP_MATCHES ? '¡Predicciones completas!' : 'Fase de grupos · Cierre 11 jun'}
          </p>
          <p className="text-2xl sm:text-3xl font-bold leading-tight">
            {predictionsCount === GROUP_MATCHES ? 'Revisa tus predicciones' : 'Haz tus predicciones'}
          </p>
          <p className="text-white/35 text-sm mt-2">
            {predictionsCount === GROUP_MATCHES
              ? 'Ya completaste los 72 partidos de grupos'
              : `${remaining} partido${remaining !== 1 ? 's' : ''} sin predecir`}
          </p>
        </div>
        <ChevronRight className="w-8 h-8 text-skyblue/50 group-hover:text-skyblue group-hover:translate-x-1.5 transition-all flex-shrink-0 ml-4" />
      </Link>

      {/* Mis Grupos */}
      <MisGrupos groupStandings={groupStandings} />

      {/* Reglas del torneo — acordeón */}
      <div className="bg-[#071729] rounded-2xl border border-[#1E3A6E]/50 shadow-lg overflow-hidden">
        <button
          onClick={() => setRulesOpen(v => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
        >
          <span className="text-sm font-semibold text-white">📋 Reglas del torneo</span>
          <ChevronDown
            className={`w-4 h-4 text-skyblue/60 transition-transform duration-300 flex-shrink-0 ${rulesOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <div
          className="grid transition-[grid-template-rows] duration-300 ease-in-out"
          style={{ gridTemplateRows: rulesOpen ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            <div className="px-5 pb-5 space-y-5 border-t border-white/6 pt-4">

              {/* Fase de grupos */}
              <div>
                <p className="text-[11px] font-semibold text-skyblue uppercase tracking-wider mb-2.5">Fase de grupos</p>
                <div className="space-y-1.5">
                  {[
                    ['Signo 1X2 correcto', '+1 pt'],
                    ['Diferencia de goles exacta', '+1 pt'],
                    ['Resultado exacto', '+3 pts'],
                    ['1° lugar del grupo correcto', '+2 pts'],
                    ['2° lugar del grupo correcto', '+1 pt'],
                  ].map(([label, pts]) => (
                    <div key={label} className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">{label}</span>
                      <span className="font-semibold text-white tabular-nums">{pts}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fase eliminatoria */}
              <div>
                <p className="text-[11px] font-semibold text-skyblue uppercase tracking-wider mb-2.5">Fase eliminatoria</p>
                <div className="rounded-lg border border-white/6 overflow-hidden text-xs">
                  <div className="grid grid-cols-3 bg-white/4 px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                    <span>Ronda</span>
                    <span className="text-center">Ganador</span>
                    <span className="text-right">Exacto</span>
                  </div>
                  {[
                    ['1/16 (R32)', '+2 pts', '+4 pts'],
                    ['Octavos (R16)', '+3 pts', '+6 pts'],
                    ['Cuartos de final', '+4 pts', '+8 pts'],
                    ['Semifinales', '+5 pts', '+10 pts'],
                    ['Final — Campeón', '+15 pts', '—'],
                    ['Final — Subcampeón', '+8 pts', '—'],
                    ['3er puesto', '+5 pts', '—'],
                  ].map(([round, winner, exact], i) => (
                    <div
                      key={round}
                      className={`grid grid-cols-3 px-3 py-2 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
                    >
                      <span className="text-gray-400">{round}</span>
                      <span className="text-center font-semibold text-white">{winner}</span>
                      <span className="text-right font-semibold text-white">{exact}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Predicciones especiales */}
              <div>
                <p className="text-[11px] font-semibold text-skyblue uppercase tracking-wider mb-2.5">Predicciones especiales</p>
                <div className="space-y-1.5">
                  {[
                    ['Bota de Oro (máx. goleador)', '+10 pts'],
                    ['Balón de Oro (mejor jugador)', '+8 pts'],
                    ['Guante de Oro (mejor portero)', '+6 pts'],
                    ['Total de goles del torneo (±5)', '+5 pts'],
                    ['Gol más rápido (equipo)', '+5 pts'],
                  ].map(([label, pts]) => (
                    <div key={label} className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">{label}</span>
                      <span className="font-semibold text-white tabular-nums">{pts}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
