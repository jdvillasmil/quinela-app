'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, Target, ChevronRight, Star } from 'lucide-react'
import type { LeaderboardEntry } from '@/types'

interface Props {
  firstName: string
  entry: LeaderboardEntry | null
  totalUsers: number
  predictionsCount: number
}

const TOURNAMENT_START = new Date('2026-06-11T18:00:00Z') // 14:00 Bogotá (UTC-4)
const GROUP_MATCHES = 48

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
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center">
        <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-skyblue/80 text-[10px] font-semibold mt-2 uppercase tracking-widest">
        {label}
      </span>
    </div>
  )
}

function TimeSeparator() {
  return <span className="text-white/30 text-2xl font-light self-start mt-5">:</span>
}

export default function DashboardClient({ firstName, entry, totalUsers, predictionsCount }: Props) {
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
        <h1 className="text-2xl font-semibold text-navy">
          {firstName ? `¡Hola, ${firstName}!` : '¡Bienvenido!'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Quiniela Mundial USA · MEX · CAN 2026 · Proyelec International
        </p>
      </div>

      {/* Countdown */}
      <div className="relative bg-navy rounded-2xl p-6 sm:p-8 overflow-hidden shadow-lg">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-skyblue/5" />
          <div className="absolute -bottom-12 -left-12 w-60 h-60 rounded-full bg-skyblue/5" />
        </div>

        <div className="relative">
          <p className="text-skyblue text-xs font-semibold uppercase tracking-widest mb-0.5">
            {timeLeft?.started ? 'El torneo está en curso' : 'El torneo comienza en'}
          </p>
          <p className="text-white/40 text-xs mb-6">
            11 jun 2026 · Estadio Azteca, Mexico City · 14:00 h (UTC-4)
          </p>

          {timeLeft === null ? (
            /* Skeleton mientras hidrata */
            <div className="flex gap-3 sm:gap-5">
              {['--', '--', '--', '--'].map((v, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-white/20 tabular-nums">{v}</span>
                  </div>
                  <span className="text-white/10 text-[10px] font-semibold mt-2 uppercase tracking-widest">···</span>
                </div>
              ))}
            </div>
          ) : timeLeft.started ? (
            <p className="text-3xl font-bold text-white">⚽ ¡El Mundial está en curso!</p>
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

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Points */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-navy/8 flex items-center justify-center">
              <Star className="w-4 h-4 text-skyblue" />
            </div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Mis puntos
            </span>
          </div>
          <p className="text-4xl font-bold text-navy tabular-nums">{points}</p>
          <div className="mt-4 space-y-1.5 text-xs border-t border-gray-100 pt-3">
            <div className="flex justify-between text-gray-500">
              <span>Grupos</span>
              <span className="font-semibold text-gray-700">{entry?.group_points ?? 0} pts</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Eliminatorias</span>
              <span className="font-semibold text-gray-700">{entry?.knockout_points ?? 0} pts</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Especiales</span>
              <span className="font-semibold text-gray-700">{entry?.special_points ?? 0} pts</span>
            </div>
          </div>
        </div>

        {/* Ranking */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-navy/8 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-skyblue" />
            </div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Posición
            </span>
          </div>
          {rank !== null ? (
            <>
              <p className="text-4xl font-bold text-navy tabular-nums">#{rank}</p>
              <p className="text-xs text-gray-400 mt-2">
                de{' '}
                <span className="font-semibold text-gray-600">{totalUsers}</span>{' '}
                participante{totalUsers !== 1 ? 's' : ''}
              </p>
              {rank === 1 && (
                <p className="text-xs text-amber-500 font-semibold mt-2">🥇 ¡Líder del torneo!</p>
              )}
              {rank === 2 && (
                <p className="text-xs text-gray-400 font-semibold mt-2">🥈 Subcampeón por ahora</p>
              )}
              {rank === 3 && (
                <p className="text-xs text-orange-400 font-semibold mt-2">🥉 En el podio</p>
              )}
            </>
          ) : (
            <>
              <p className="text-4xl font-bold text-gray-200">—</p>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Haz predicciones para aparecer en el ranking
              </p>
            </>
          )}
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-navy/8 flex items-center justify-center">
              <Target className="w-4 h-4 text-skyblue" />
            </div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Progreso
            </span>
          </div>
          <div className="flex items-end gap-1.5">
            <p className="text-4xl font-bold text-navy tabular-nums">{predictionsCount}</p>
            <p className="text-lg text-gray-300 font-normal mb-0.5">/ {GROUP_MATCHES}</p>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">partidos predichos</p>
          <div className="mt-4">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-skyblue rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-gray-400">{progress}% completo</span>
              {progress === 100 && (
                <span className="text-xs font-semibold text-emerald-500">✓ Completo</span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Giant CTA */}
      <Link
        href="/predictions"
        className="group flex items-center justify-between w-full bg-navy hover:bg-[#001a4d] border-2 border-transparent hover:border-skyblue/40 transition-all duration-200 rounded-2xl p-6 sm:p-8 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
      >
        <div>
          <p className="text-skyblue text-xs font-semibold uppercase tracking-widest mb-1.5">
            {predictionsCount === 0
              ? '¡Empieza ahora — quedan 22 días!'
              : predictionsCount < GROUP_MATCHES
              ? 'Continúa donde quedaste'
              : '¡Predicciones completas!'}
          </p>
          <p className="text-2xl sm:text-3xl font-bold leading-tight">
            {predictionsCount < GROUP_MATCHES ? 'Haz tus predicciones' : 'Revisa tus predicciones'}
          </p>
          <p className="text-white/40 text-sm mt-2">
            {predictionsCount === GROUP_MATCHES
              ? 'Ya completaste los 48 partidos de grupos'
              : `${remaining} partido${remaining !== 1 ? 's' : ''} sin predecir · Cierre el 11 de junio`}
          </p>
        </div>
        <ChevronRight className="w-8 h-8 text-skyblue/60 group-hover:text-skyblue group-hover:translate-x-1.5 transition-all flex-shrink-0 ml-4" />
      </Link>

    </div>
  )
}
