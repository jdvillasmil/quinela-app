'use client'

import { useState, useTransition, useCallback, useMemo } from 'react'
import { Loader2, Save, CheckCircle, AlertCircle } from 'lucide-react'
import type { Match, BracketPrediction } from '@/types'
import { saveBracketPredictions } from './actions'
import { teamEs } from '@/lib/i18n/teams'

// ── Layout constants ──────────────────────────────────────────────────────────
const CW = 144    // card width
const CH = 68     // card height
const SH = 96     // vertical slot per r32 match (card + gap)
const GX = 64     // horizontal gap between columns (connector zone)
const CS = CW + GX // column step = 208
const PAD = 16    // canvas padding
const LABEL_H = 26 // round-label row height

const MAIN_ROUNDS = ['r32', 'r16', 'qf', 'sf', 'final'] as const
type MainRound = (typeof MAIN_ROUNDS)[number]

const ROUND_LABELS: Record<MainRound, string> = {
  r32: '1/16',
  r16: 'Octavos',
  qf: 'Cuartos',
  sf: 'Semis',
  final: 'Final',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function winRef(s: string | null | undefined): number | null {
  if (!s || !s.startsWith('W')) return null
  const n = parseInt(s.slice(1), 10)
  return isNaN(n) ? null : n
}

// ── Layout types ──────────────────────────────────────────────────────────────
interface MatchPos { match: Match; x: number; y: number }
interface SVGEdge { x1: number; y1: number; x2: number; y2: number }
interface Layout {
  nodes: MatchPos[]
  edges: SVGEdge[]
  svgW: number
  svgH: number
  third: Match | null
}

// ── Layout computation ────────────────────────────────────────────────────────
function computeLayout(matches: Match[]): Layout {
  const third = matches.find(m => m.phase === 'third') ?? null

  const byNum: Record<number, Match> = {}
  for (const m of matches) byNum[m.match_number] = m

  const byPhase: Record<string, Match[]> = {}
  for (const r of MAIN_ROUNDS) {
    byPhase[r] = matches
      .filter(m => m.phase === r)
      .sort((a, b) => a.match_number - b.match_number)
  }

  // y-position for each match id, relative to canvas content (before PAD)
  const yOf: Record<number, number> = {}

  // r32: evenly distributed
  ;(byPhase.r32 ?? []).forEach((m, i) => { yOf[m.id] = i * SH })

  // subsequent rounds: midpoint of two children
  for (const r of ['r16', 'qf', 'sf', 'final'] as const) {
    for (const m of byPhase[r] ?? []) {
      const hN = winRef(m.home_team)
      const aN = winRef(m.away_team)
      const hY = hN !== null ? yOf[byNum[hN]?.id] : undefined
      const aY = aN !== null ? yOf[byNum[aN]?.id] : undefined

      yOf[m.id] =
        hY !== undefined && aY !== undefined ? (hY + aY) / 2 :
        hY ?? aY ?? 0
    }
  }

  // Positioned nodes
  const nodes: MatchPos[] = []
  for (let ri = 0; ri < MAIN_ROUNDS.length; ri++) {
    for (const m of byPhase[MAIN_ROUNDS[ri]] ?? []) {
      nodes.push({
        match: m,
        x: PAD + ri * CS,
        y: PAD + (yOf[m.id] ?? 0),
      })
    }
  }

  // SVG connector edges
  const edges: SVGEdge[] = []
  for (let ri = 1; ri < MAIN_ROUNDS.length; ri++) {
    for (const m of byPhase[MAIN_ROUNDS[ri]] ?? []) {
      const px = PAD + ri * CS
      const py = PAD + (yOf[m.id] ?? 0)
      const mx = px - GX / 2   // x of vertical bar
      const pcy = py + CH / 2  // parent card center y

      const hN = winRef(m.home_team)
      const aN = winRef(m.away_team)
      const hChild = hN !== null ? byNum[hN] : null
      const aChild = aN !== null ? byNum[aN] : null

      if (hChild) {
        const cY = PAD + (yOf[hChild.id] ?? 0) + CH / 2
        edges.push({ x1: PAD + (ri - 1) * CS + CW, y1: cY, x2: mx, y2: cY })
      }
      if (aChild) {
        const cY = PAD + (yOf[aChild.id] ?? 0) + CH / 2
        edges.push({ x1: PAD + (ri - 1) * CS + CW, y1: cY, x2: mx, y2: cY })
      }
      if (hChild && aChild) {
        const hCY = PAD + (yOf[hChild.id] ?? 0) + CH / 2
        const aCY = PAD + (yOf[aChild.id] ?? 0) + CH / 2
        edges.push({ x1: mx, y1: hCY, x2: mx, y2: aCY })
      }
      // line from vertical bar to parent card left edge
      edges.push({ x1: mx, y1: pcy, x2: px, y2: pcy })
    }
  }

  const r32Cnt = byPhase.r32?.length ?? 0
  const svgH = r32Cnt > 0
    ? PAD * 2 + (r32Cnt - 1) * SH + CH
    : CH + PAD * 2
  // last column needs no right gap
  const svgW = PAD * 2 + MAIN_ROUNDS.length * CW + (MAIN_ROUNDS.length - 1) * GX

  return { nodes, edges, svgW, svgH, third }
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  initialMatches: Match[]
  initialPredictions: BracketPrediction[]
}

export default function BracketClient({ initialMatches, initialPredictions }: Props) {
  const [predictions, setPredictions] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {}
    for (const p of initialPredictions) map[p.match_id] = p.predicted_winner
    return map
  })
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const isBracketLocked = new Date() > new Date('2026-07-08T00:00:00-04:00')

  const resolveTeam = useCallback((teamStr: string): string => {
    if (!teamStr) return 'TBD'
    if (teamStr.startsWith('W')) {
      const n = parseInt(teamStr.slice(1), 10)
      const match = initialMatches.find(m => m.match_number === n)
      if (match && predictions[match.id]) return predictions[match.id]
      return teamStr
    }
    if (teamStr.startsWith('L')) {
      const n = parseInt(teamStr.slice(1), 10)
      const match = initialMatches.find(m => m.match_number === n)
      if (match && predictions[match.id]) {
        const h = resolveTeam(match.home_team)
        const a = resolveTeam(match.away_team)
        const w = predictions[match.id]
        if (w === h) return a
        if (w === a) return h
      }
      return teamStr
    }
    return teamStr
  }, [initialMatches, predictions])

  const handleSelect = (matchId: number, team: string) => {
    if (isBracketLocked) return
    if (!team || team === 'TBD' || team.startsWith('W') || team.startsWith('L')) return
    setPredictions(prev => ({ ...prev, [matchId]: team }))
    setResult(null)
  }

  const handleSave = () => {
    if (isBracketLocked) return
    const payload = initialMatches.map(m => {
      const home = resolveTeam(m.home_team)
      const away = resolveTeam(m.away_team)
      const pred = predictions[m.id]
      if (
        pred &&
        (pred === home || pred === away) &&
        !pred.startsWith('W') &&
        !pred.startsWith('L') &&
        pred !== 'TBD'
      ) {
        return { match_id: m.id, predicted_winner: pred }
      }
      return null
    }).filter(Boolean) as { match_id: number; predicted_winner: string }[]

    startTransition(async () => {
      const res = await saveBracketPredictions(payload)
      setResult(res)
    })
  }

  const { nodes, edges, svgW, svgH, third } = useMemo(
    () => computeLayout(initialMatches),
    [initialMatches]
  )

  // ── Card renderer ─────────────────────────────────────────────────────────
  const renderCard = (match: Match) => {
    const home = resolveTeam(match.home_team)
    const away = resolveTeam(match.away_team)
    const pred = predictions[match.id]
    const winner = pred === home || pred === away ? pred : null

    const canPick = (t: string) =>
      !isBracketLocked && !!t && t !== 'TBD' && !t.startsWith('W') && !t.startsWith('L')

    const rowBase = 'flex items-center w-full h-1/2 px-2.5 text-xs font-medium transition-colors overflow-hidden'

    return (
      <div className="flex flex-col h-full overflow-hidden rounded-lg border border-[#1E3A6E] bg-[#071729]">
        <button
          onClick={() => canPick(home) && handleSelect(match.id, home)}
          disabled={!canPick(home)}
          className={[
            rowBase,
            'border-b border-[#1E3A6E]',
            winner === home ? 'bg-skyblue/20 text-skyblue font-bold' : 'text-gray-300 hover:bg-[#0D1F3C]',
            !canPick(home) ? 'cursor-default' : 'cursor-pointer',
          ].join(' ')}
        >
          <span className="truncate min-w-0 flex-1">{teamEs(home)}</span>
          {winner === home && <CheckCircle className="w-3 h-3 text-skyblue ml-1 shrink-0" />}
        </button>

        <button
          onClick={() => canPick(away) && handleSelect(match.id, away)}
          disabled={!canPick(away)}
          className={[
            rowBase,
            winner === away ? 'bg-skyblue/20 text-skyblue font-bold' : 'text-gray-300 hover:bg-[#0D1F3C]',
            !canPick(away) ? 'cursor-default' : 'cursor-pointer',
          ].join(' ')}
        >
          <span className="truncate min-w-0 flex-1">{teamEs(away)}</span>
          {winner === away && <CheckCircle className="w-3 h-3 text-skyblue ml-1 shrink-0" />}
        </button>
      </div>
    )
  }

  const canvasH = svgH + LABEL_H

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Bracket Eliminatorio</h1>
        <p className="text-sm text-gray-400 mt-1">
          {isBracketLocked
            ? 'El bracket está bloqueado.'
            : 'Haz clic en el equipo ganador para avanzarlo al siguiente cruce.'}
        </p>
      </div>

      {/* Bracket canvas */}
      <div className="overflow-auto rounded-xl border border-[#1E3A6E]/40">
        <div className="relative" style={{ width: svgW, height: canvasH }}>

          {/* Round labels */}
          {MAIN_ROUNDS.map((r, ri) => (
            <div
              key={r}
              className="absolute top-0 flex items-center justify-center text-[10px] font-bold text-skyblue/70 uppercase tracking-wider"
              style={{ left: PAD + ri * CS, width: CW, height: LABEL_H }}
            >
              {ROUND_LABELS[r]}
            </div>
          ))}

          {/* SVG connector lines */}
          <svg
            className="absolute pointer-events-none"
            style={{ top: LABEL_H, left: 0 }}
            width={svgW}
            height={svgH}
          >
            {edges.map((e, i) => (
              <line
                key={i}
                x1={e.x1} y1={e.y1}
                x2={e.x2} y2={e.y2}
                stroke="#64AFE6"
                strokeWidth={1.5}
                opacity={0.3}
                strokeLinecap="round"
              />
            ))}
          </svg>

          {/* Match cards */}
          {nodes.map(({ match, x, y }) => (
            <div
              key={match.id}
              className="absolute"
              style={{ left: x, top: y + LABEL_H, width: CW, height: CH }}
            >
              {renderCard(match)}
            </div>
          ))}
        </div>
      </div>

      {/* Third place */}
      {third && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Tercer Puesto
          </p>
          <div style={{ width: CW, height: CH }}>
            {renderCard(third)}
          </div>
        </div>
      )}

      {/* Save bar */}
      <div className="fixed bottom-[80px] sm:bottom-0 left-0 right-0 sm:left-64 bg-[#071729] border-t border-[#1E3A6E]/60 p-4 shadow-lg z-40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex-1">
            {result ? (
              <div className={`flex items-center gap-2 text-sm font-medium ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {result.message}
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                {isBracketLocked
                  ? 'El bracket se encuentra bloqueado.'
                  : 'Guarda tu bracket antes de que inicien los partidos eliminatorios.'}
              </p>
            )}
          </div>
          {!isBracketLocked && (
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center justify-center gap-2 px-6 py-2.5 w-full sm:w-auto bg-skyblue text-navy text-sm font-bold rounded-lg hover:bg-skyblue/90 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
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
