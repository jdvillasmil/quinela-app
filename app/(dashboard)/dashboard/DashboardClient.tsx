'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, Target, ChevronRight, Star, CalendarDays } from 'lucide-react'
import type { LeaderboardEntry } from '@/types'
import type { NextMatch } from './page'

interface Props {
  firstName: string
  entry: LeaderboardEntry | null
  totalUsers: number
  predictionsCount: number
  nextMatches: NextMatch[]
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

const TOURNAMENT_START = new Date('2026-06-11T18:00:00Z') // 14:00 Bogotá (UTC-4)
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

export default function DashboardClient({ firstName, entry, totalUsers, predictionsCount, nextMatches }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

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

      {/* Countdown */}
      <div className="relative bg-navy rounded-2xl p-6 sm:p-8 overflow-hidden shadow-lg shadow-black/30 border border-[#1E3A6E]/60">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-skyblue/6" />
          <div className="absolute -bottom-12 -left-12 w-60 h-60 rounded-full bg-skyblue/4" />
        </div>

        <div className="relative">
          <p className="text-skyblue text-xs font-semibold uppercase tracking-widest mb-0.5">
            {timeLeft?.started ? 'El torneo está en curso' : 'El torneo comienza en'}
          </p>
          <p className="text-white/35 text-xs mb-6">
            11 jun 2026 · Estadio Azteca, Mexico City · 14:00 h (UTC-4)
          </p>

          {timeLeft === null ? (
            <div className="flex gap-3 sm:gap-5">
              {['--', '--', '--', '--'].map((v, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black/20 border border-white/10 rounded-xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-white/20 tabular-nums">{v}</span>
                  </div>
                  <span className="text-white/10 text-[10px] font-semibold mt-2 uppercase tracking-widest">···</span>
                </div>
              ))}
            </div>
          ) : timeLeft.started ? (
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-3xl font-bold text-white">¡El Mundial está en curso!</p>
            </div>
          ) : (
            <div className="flex items-start gap-2 sm:gap-4">
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
      </div>

      {/* Próximos partidos */}
      {nextMatches.length > 0 && (
        <div className="bg-[#071729] rounded-2xl border border-[#1E3A6E]/50 shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/6">
            <CalendarDays className="w-4 h-4 text-skyblue" />
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Próximos partidos
            </span>
          </div>
          <ul className="divide-y divide-white/5">
            {nextMatches.map((match) => {
              const { day, time } = formatMatchDate(match.match_date)
              return (
                <li key={match.id} className="flex items-center gap-4 px-5 py-3.5">
                  {/* Date/time */}
                  <div className="w-20 flex-shrink-0">
                    <p className="text-[11px] text-skyblue font-semibold tabular-nums">{time} <span className="text-skyblue/50">UTC-4</span></p>
                    <p className="text-[11px] text-gray-500 capitalize mt-0.5">{day}</p>
                  </div>
                  {/* Matchup */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <span className="text-base leading-none">{match.home_flag ?? '🏳'}</span>
                      <span className="truncate">{match.home_team}</span>
                      <span className="text-gray-600 text-xs font-normal flex-shrink-0">vs</span>
                      <span className="text-base leading-none">{match.away_flag ?? '🏳'}</span>
                      <span className="truncate">{match.away_team}</span>
                    </div>
                    {match.venue && (
                      <p className="text-[11px] text-gray-600 mt-0.5 truncate">{match.venue}</p>
                    )}
                  </div>
                  {/* Group badge */}
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

    </div>
  )
}
