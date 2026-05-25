import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { Profile, LeaderboardEntry } from '@/types'
import { Shield, Target, Trophy, Zap, TrendingUp } from 'lucide-react'
import { teamEs } from '@/lib/i18n/teams'

export const metadata: Metadata = {
  title: 'Mi Perfil — Quiniela Proyelec',
}

type MatchInfo = {
  id: number
  home_team: string
  away_team: string
  home_flag: string | null
  away_flag: string | null
  home_score: number | null
  away_score: number | null
  phase: string
  group_name: string | null
  match_date: string
  match_number: number
}

type PredictionRow = {
  id: number
  match_id: number
  predicted_home: number
  predicted_away: number
  points_earned: number
  matches: MatchInfo
}

// Max pts per phase determines EXACTO threshold
const EXACT_THRESHOLDS: Record<string, number> = {
  groups: 5,
  r32: 4,
  r16: 6,
  qf: 8,
  sf: 10,
  third: 5,
  final: 15,
}

function getBadge(phase: string, pts: number): 'EXACTO' | 'ACERTADO' | 'FALLADO' {
  if (pts === 0) return 'FALLADO'
  if (pts >= (EXACT_THRESHOLDS[phase] ?? 5)) return 'EXACTO'
  return 'ACERTADO'
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileResult, leaderboardResult, predictionsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    (supabase as any).from('leaderboard').select('*').order('rank', { ascending: true }),
    supabase
      .from('predictions')
      .select(`
        id, match_id, predicted_home, predicted_away, points_earned,
        matches!inner(id, home_team, away_team, home_flag, away_flag, home_score, away_score, phase, group_name, match_date, match_number)
      `)
      .eq('user_id', user.id)
      .eq('matches.status', 'finished')
      .order('match_id', { ascending: false }),
  ])

  const profile = profileResult.data as Profile | null
  const leaderboard = ((leaderboardResult.data ?? []) as LeaderboardEntry[])
  const myEntry = leaderboard.find(e => e.user_id === user.id) ?? null
  const totalUsers = leaderboard.length
  const predictions = (predictionsResult.data ?? []) as PredictionRow[]

  // Stats
  const total = predictions.length
  const withPoints = predictions.filter(p => p.points_earned > 0).length
  const exactCount = predictions.filter(p => getBadge(p.matches.phase, p.points_earned) === 'EXACTO').length
  const accuracy = total > 0 ? Math.round((withPoints / total) * 100) : 0
  const sumPts = predictions.reduce((acc, p) => acc + p.points_earned, 0)
  const avgPoints = total > 0 ? (sumPts / total).toFixed(1) : null

  const initials = `${profile?.first_name?.[0] ?? ''}${profile?.last_name?.[0] ?? ''}`.toUpperCase()
    || user.email?.[0]?.toUpperCase()
    || 'U'
  const fullName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : 'Usuario Proyelec'
  const isAdmin = profile?.role === 'admin'

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* ── HEADER ── */}
      <div className="relative bg-navy rounded-2xl overflow-hidden border border-[#1E3A6E]/60 shadow-lg p-6 sm:p-7">
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-skyblue/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-skyblue/4 pointer-events-none" />

        <div className="relative flex items-center gap-5">
          {/* Avatar */}
          <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-[#0a1f4e] border border-skyblue/25 flex items-center justify-center shadow-inner">
            <span className="text-2xl font-bold text-skyblue">{initials}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <h1 className="text-xl font-bold text-white leading-tight">{fullName}</h1>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25 flex-shrink-0">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
              )}
            </div>
            <p className="text-sm text-skyblue/70 mb-3">@{profile?.username}</p>

            {myEntry ? (
              <span className="inline-flex items-center gap-1.5 bg-white/6 border border-white/10 rounded-full px-3 py-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-white tabular-nums">
                  #{myEntry.rank}
                </span>
                <span className="text-xs text-gray-400">de {totalUsers} participantes</span>
              </span>
            ) : (
              <span className="inline-flex items-center bg-white/4 border border-white/8 rounded-full px-3 py-1">
                <span className="text-xs text-gray-500">Sin posición en el ranking aún</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── STATS 2×2 ── */}
      <div className="grid grid-cols-2 gap-3">

        <StatCard
          icon={<Target className="w-3.5 h-3.5 text-emerald-400" />}
          iconBg="bg-emerald-500/10"
          label="Precisión"
          value={`${accuracy}%`}
          sub={total > 0 ? `${withPoints} de ${total} predicciones` : 'Sin partidos aún'}
        />

        <StatCard
          icon={<Zap className="w-3.5 h-3.5 text-skyblue" />}
          iconBg="bg-skyblue/10"
          label="Exactos"
          value={String(exactCount)}
          sub="resultados exactos"
        />

        <StatCard
          icon={<TrendingUp className="w-3.5 h-3.5 text-violet-400" />}
          iconBg="bg-violet-500/10"
          label="Promedio"
          value={avgPoints ?? '—'}
          sub="pts por partido"
        />

        <StatCard
          icon={<Trophy className="w-3.5 h-3.5 text-amber-400" />}
          iconBg="bg-amber-500/10"
          label="Total"
          value={String(myEntry?.total_points ?? 0)}
          sub="puntos acumulados"
        />

      </div>

      {/* ── HISTORIAL ── */}
      <div className="bg-[#071729] rounded-xl border border-[#1E3A6E]/50 shadow-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/6 flex items-center gap-2.5">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Historial de predicciones
          </span>
          {total > 0 && (
            <span className="text-[10px] font-semibold text-skyblue/60 bg-skyblue/8 border border-skyblue/15 rounded-full px-2 py-0.5 tabular-nums">
              {total}
            </span>
          )}
        </div>

        {predictions.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-3xl mb-3">⚽</p>
            <p className="text-sm font-medium text-gray-400">El torneo aún no ha comenzado</p>
            <p className="text-xs text-gray-600 mt-1.5">
              El historial aparecerá cuando los partidos finalicen.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[520px]">
              <thead className="bg-[#030A15] border-b border-[#1E3A6E]/50 text-gray-500 font-semibold text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Partido</th>
                  <th className="px-4 py-3 text-center">Predicción</th>
                  <th className="px-4 py-3 text-center">Resultado</th>
                  <th className="px-4 py-3 text-center">Pts</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E3A6E]/30">
                {predictions.map((pred) => {
                  const m = pred.matches
                  const badge = getBadge(m.phase, pred.points_earned)
                  return (
                    <tr key={pred.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-base leading-none">{m.home_flag ?? '🏳'}</span>
                          <span className="font-medium text-gray-200">{teamEs(m.home_team)}</span>
                          <span className="text-gray-600">vs</span>
                          <span className="text-base leading-none">{m.away_flag ?? '🏳'}</span>
                          <span className="font-medium text-gray-200">{teamEs(m.away_team)}</span>
                        </div>
                        {m.group_name && (
                          <p className="text-[10px] text-gray-600 mt-0.5">Grupo {m.group_name}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="text-xs font-semibold text-gray-400 tabular-nums">
                          {pred.predicted_home}–{pred.predicted_away}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="text-sm font-bold text-white tabular-nums">
                          {m.home_score}–{m.away_score}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`text-sm font-bold tabular-nums ${
                          pred.points_earned > 0 ? 'text-skyblue' : 'text-gray-600'
                        }`}>
                          {pred.points_earned > 0 ? `+${pred.points_earned}` : '0'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <PredictionBadge badge={badge} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="bg-[#071729] rounded-xl border border-[#1E3A6E]/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white tabular-nums leading-none">{value}</p>
      <p className="text-xs text-gray-500 mt-1.5">{sub}</p>
    </div>
  )
}

function PredictionBadge({ badge }: { badge: 'EXACTO' | 'ACERTADO' | 'FALLADO' }) {
  if (badge === 'EXACTO') return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
      EXACTO
    </span>
  )
  if (badge === 'ACERTADO') return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide bg-skyblue/15 text-skyblue border border-skyblue/25">
      ACERTADO
    </span>
  )
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide bg-red-500/10 text-red-400 border border-red-500/20">
      FALLADO
    </span>
  )
}
