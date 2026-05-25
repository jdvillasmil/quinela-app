import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { LeaderboardEntry } from '@/types'
import { Shield, Trophy, Target, Zap, TrendingUp, ArrowLeft, Calendar } from 'lucide-react'
import Link from 'next/link'

const GROUP_MATCHES = 72

const EXACT_THRESHOLDS: Record<string, number> = {
  groups: 5, r32: 4, r16: 6, qf: 8, sf: 10, third: 5, final: 15,
}

export async function generateMetadata({
  params,
}: {
  params: { username: string }
}): Promise<Metadata> {
  return {
    title: `@${params.username} — Quiniela Proyelec`,
  }
}

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string }
}) {
  const { username } = params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Profiles are readable by all authenticated users (RLS: "authenticated read all")
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, first_name, last_name, role, created_at, avatar_url')
    .eq('username', username)
    .single() as {
      data: {
        id: string
        username: string
        first_name: string
        last_name: string
        role: string
        created_at: string
        avatar_url: string | null
      } | null
      error: unknown
    }

  if (!profile) notFound()

  // If visiting own profile, redirect to the personal profile page
  if (profile.id === user.id) redirect('/profile')

  // Leaderboard view uses SECURITY DEFINER — accessible to all authenticated users
  const { data: rawLeaderboard } = await (supabase as any)
    .from('leaderboard')
    .select('*')
    .order('rank', { ascending: true })

  const leaderboard = ((rawLeaderboard ?? []) as LeaderboardEntry[])
  const entry = leaderboard.find(e => e.user_id === profile.id) ?? null
  const totalUsers = leaderboard.length

  const initials = `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase()
    || profile.username[0].toUpperCase()
  const fullName = profile.first_name && profile.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile.username
  const isAdmin = profile.role === 'admin'
  const picks = entry?.predictions_count ?? 0
  const picksProgress = Math.round((picks / GROUP_MATCHES) * 100)

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Back */}
      <Link
        href="/leaderboard"
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-skyblue transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Tabla de posiciones
      </Link>

      {/* ── HEADER ── */}
      <div className="relative bg-navy rounded-2xl overflow-hidden border border-[#1E3A6E]/60 shadow-lg p-6 sm:p-7">
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-skyblue/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-skyblue/4 pointer-events-none" />

        <div className="relative flex items-center gap-5">
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
            <p className="text-sm text-skyblue/70 mb-3">@{profile.username}</p>

            {entry ? (
              <span className="inline-flex items-center gap-1.5 bg-white/6 border border-white/10 rounded-full px-3 py-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-white tabular-nums">
                  #{entry.rank}
                </span>
                <span className="text-xs text-gray-400">de {totalUsers} participantes</span>
              </span>
            ) : (
              <span className="inline-flex items-center bg-white/4 border border-white/8 rounded-full px-3 py-1">
                <span className="text-xs text-gray-500">Sin posición en el ranking</span>
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
          label="Grupos"
          value={String(entry?.group_points ?? 0)}
          sub="pts fase de grupos"
        />

        <StatCard
          icon={<Zap className="w-3.5 h-3.5 text-skyblue" />}
          iconBg="bg-skyblue/10"
          label="Eliminatorias"
          value={String(entry?.knockout_points ?? 0)}
          sub="pts eliminatorias"
        />

        <StatCard
          icon={<TrendingUp className="w-3.5 h-3.5 text-violet-400" />}
          iconBg="bg-violet-500/10"
          label="Especiales"
          value={String(entry?.special_points ?? 0)}
          sub="pts predicciones especiales"
        />

        <StatCard
          icon={<Trophy className="w-3.5 h-3.5 text-amber-400" />}
          iconBg="bg-amber-500/10"
          label="Total"
          value={String(entry?.total_points ?? 0)}
          sub="puntos acumulados"
        />

      </div>

      {/* ── PICKS PROGRESS ── */}
      <div className="bg-[#071729] rounded-xl border border-[#1E3A6E]/50 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Predicciones de grupos
          </span>
          <span className={`text-xs font-bold tabular-nums ${
            picks === GROUP_MATCHES ? 'text-emerald-400' : 'text-gray-400'
          }`}>
            {picks}/{GROUP_MATCHES}
          </span>
        </div>
        <div className="h-2 bg-white/8 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              picks === GROUP_MATCHES ? 'bg-emerald-400' : 'bg-skyblue'
            }`}
            style={{ width: `${picksProgress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-gray-600">{picksProgress}% completado</span>
          {picks === GROUP_MATCHES && (
            <span className="text-xs font-semibold text-emerald-400">Completo</span>
          )}
        </div>
      </div>

      {/* ── MEMBER SINCE ── */}
      <div className="bg-[#071729] rounded-xl border border-[#1E3A6E]/50 px-5 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-skyblue/10 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-4 h-4 text-skyblue" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Miembro desde</p>
          <p className="text-sm font-medium text-gray-200 mt-0.5">
            {new Date(profile.created_at).toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
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
