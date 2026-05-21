'use client'

import { useState, useTransition, useCallback, useMemo } from 'react'
import { Loader2, Save, CheckCircle, AlertCircle } from 'lucide-react'
import type { Match, BracketPrediction } from '@/types'
import { saveBracketPredictions } from './actions'
import { teamEs } from '@/lib/i18n/teams'

// ── Layout constants ──────────────────────────────────────────────────────────
// 9-column butterfly: [L-r32][L-r16][L-qf][L-sf][FINAL][R-sf][R-qf][R-r16][R-r32]
const CW = 128    // card width
const CH = 60     // card height
const SH = 80     // vertical slot per r32 match (card + gap)
const GX = 36     // horizontal gap between columns (connector zone)
const CS = CW + GX // column step = 164
const PAD = 12    // canvas padding
const LABEL_H = 24

// Column index helpers
const COL_LABELS = ['1/16','Octavos','Cuartos','Semis','Final','Semis','Cuartos','Octavos','1/16']
const colX = (col: number) => PAD + col * CS

interface MatchPos { match: Match; x: number; y: number; isFinal?: boolean }
interface SVGEdge { x1: number; y1: number; x2: number; y2: number }
interface Layout {
  nodes: MatchPos[]
  edges: SVGEdge[]
  svgW: number
  svgH: number
  third: Match | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function winRef(s: string | null | undefined): number | null {
  if (!s || !s.startsWith('W')) return null
  const n = parseInt(s.slice(1), 10)
  return isNaN(n) ? null : n
}

// ── Layout computation ────────────────────────────────────────────────────────
function computeLayout(matches: Match[]): Layout {
  const third = matches.find(m => m.phase === 'third') ?? null

  const byNum: Record<number, Match> = {}
  for (const m of matches) byNum[m.match_number] = m

  const sorted = (phase: string) =>
    matches.filter(m => m.phase === phase).sort((a, b) => a.match_number - b.match_number)

  const r32All = sorted('r32')
  const r16All = sorted('r16')
  const qfAll  = sorted('qf')
  const sfAll  = sorted('sf')
  const finalMatch = matches.find(m => m.phase === 'final')

  // Left half (cols 0-3): r32 73-80, r16 89-92, qf 97-98, sf 101
  // Right half (cols 5-8): sf 102, qf 99-100, r16 93-96, r32 81-88
  const leftR32  = r32All.slice(0, 8)
  const rightR32 = r32All.slice(8)
  const leftR16  = r16All.slice(0, 4)
  const rightR16 = r16All.slice(4)
  const leftQF   = qfAll.slice(0, 2)
  const rightQF  = qfAll.slice(2)
  const leftSF   = sfAll[0]
  const rightSF  = sfAll[1]

  // y-positions (match.id → y in canvas, before PAD)
  const yOf: Record<number, number> = {}
  leftR32.forEach((m, i)  => { yOf[m.id] = i * SH })
  rightR32.forEach((m, i) => { yOf[m.id] = i * SH })

  const calcMid = (m: Match): number => {
    const hN = winRef(m.home_team)
    const aN = winRef(m.away_team)
    const hY = hN !== null ? yOf[byNum[hN]?.id] : undefined
    const aY = aN !== null ? yOf[byNum[aN]?.id] : undefined
    return hY !== undefined && aY !== undefined ? (hY + aY) / 2 : hY ?? aY ?? 0
  }

  for (const m of [...leftR16, ...rightR16, ...leftQF, ...rightQF]) yOf[m.id] = calcMid(m)
  if (leftSF)     yOf[leftSF.id]     = calcMid(leftSF)
  if (rightSF)    yOf[rightSF.id]    = calcMid(rightSF)
  if (finalMatch) yOf[finalMatch.id] = calcMid(finalMatch)

  // Build nodes
  const nodes: MatchPos[] = []
  const addNodes = (ms: (Match | undefined)[], col: number, isFinal = false) => {
    for (const m of ms) {
      if (m) nodes.push({ match: m, x: colX(col), y: PAD + (yOf[m.id] ?? 0), isFinal })
    }
  }
  addNodes(leftR32, 0)
  addNodes(leftR16, 1)
  addNodes(leftQF, 2)
  addNodes([leftSF], 3)
  addNodes([finalMatch], 4, true)
  addNodes([rightSF], 5)
  addNodes(rightQF, 6)
  addNodes(rightR16, 7)
  addNodes(rightR32, 8)

  // Build SVG edges
  const edges: SVGEdge[] = []

  // Left side: child right edge → mx → parent left edge
  const leftEdges = (parentMatches: (Match | undefined)[], parentCol: number) => {
    for (const parent of parentMatches) {
      if (!parent) continue
      const px  = colX(parentCol)
      const pcy = PAD + (yOf[parent.id] ?? 0) + CH / 2
      const mx  = px - GX / 2

      const hN = winRef(parent.home_team)
      const aN = winRef(parent.away_team)
      const hChild = hN !== null ? byNum[hN] : null
      const aChild = aN !== null ? byNum[aN] : null

      if (hChild) {
        const ccy = PAD + (yOf[hChild.id] ?? 0) + CH / 2
        edges.push({ x1: colX(parentCol - 1) + CW, y1: ccy, x2: mx, y2: ccy })
      }
      if (aChild) {
        const ccy = PAD + (yOf[aChild.id] ?? 0) + CH / 2
        edges.push({ x1: colX(parentCol - 1) + CW, y1: ccy, x2: mx, y2: ccy })
      }
      if (hChild && aChild) {
        const h = PAD + (yOf[hChild.id] ?? 0) + CH / 2
        const a = PAD + (yOf[aChild.id] ?? 0) + CH / 2
        if (h !== a) edges.push({ x1: mx, y1: h, x2: mx, y2: a })
      }
      edges.push({ x1: mx, y1: pcy, x2: px, y2: pcy })
    }
  }

  // Right side: child left edge → mx → parent right edge
  const rightEdges = (parentMatches: (Match | undefined)[], parentCol: number) => {
    for (const parent of parentMatches) {
      if (!parent) continue
      const px  = colX(parentCol)
      const pcy = PAD + (yOf[parent.id] ?? 0) + CH / 2
      const mx  = px + CW + GX / 2

      const hN = winRef(parent.home_team)
      const aN = winRef(parent.away_team)
      const hChild = hN !== null ? byNum[hN] : null
      const aChild = aN !== null ? byNum[aN] : null

      if (hChild) {
        const ccy = PAD + (yOf[hChild.id] ?? 0) + CH / 2
        edges.push({ x1: colX(parentCol + 1), y1: ccy, x2: mx, y2: ccy })
      }
      if (aChild) {
        const ccy = PAD + (yOf[aChild.id] ?? 0) + CH / 2
        edges.push({ x1: colX(parentCol + 1), y1: ccy, x2: mx, y2: ccy })
      }
      if (hChild && aChild) {
        const h = PAD + (yOf[hChild.id] ?? 0) + CH / 2
        const a = PAD + (yOf[aChild.id] ?? 0) + CH / 2
        if (h !== a) edges.push({ x1: mx, y1: h, x2: mx, y2: a })
      }
      edges.push({ x1: mx, y1: pcy, x2: px + CW, y2: pcy })
    }
  }

  // Left side: r16←r32, qf←r16, sf←qf
  leftEdges(leftR16, 1)
  leftEdges(leftQF, 2)
  leftEdges([leftSF], 3)

  // Final: left sf → final (left connector), right sf → final (right connector)
  if (finalMatch && leftSF && rightSF) {
    const fcy   = PAD + (yOf[finalMatch.id] ?? 0) + CH / 2
    const lscy  = PAD + (yOf[leftSF.id] ?? 0) + CH / 2
    const rscy  = PAD + (yOf[rightSF.id] ?? 0) + CH / 2
    const mxL   = colX(4) - GX / 2
    const mxR   = colX(4) + CW + GX / 2

    edges.push({ x1: colX(3) + CW, y1: lscy, x2: mxL, y2: lscy })
    if (lscy !== fcy) edges.push({ x1: mxL, y1: lscy, x2: mxL, y2: fcy })
    edges.push({ x1: mxL, y1: fcy, x2: colX(4), y2: fcy })

    edges.push({ x1: colX(5), y1: rscy, x2: mxR, y2: rscy })
    if (rscy !== fcy) edges.push({ x1: mxR, y1: rscy, x2: mxR, y2: fcy })
    edges.push({ x1: mxR, y1: fcy, x2: colX(4) + CW, y2: fcy })
  }

  // Right side: sf←qf, qf←r16, r16←r32
  rightEdges([rightSF], 5)
  rightEdges(rightQF, 6)
  rightEdges(rightR16, 7)

  const r32Cnt = leftR32.length
  const svgH   = r32Cnt > 0 ? PAD * 2 + (r32Cnt - 1) * SH + CH : CH + PAD * 2
  const svgW   = PAD * 2 + 9 * CW + 8 * GX

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
  const renderCard = (match: Match, isFinal = false) => {
    const home   = resolveTeam(match.home_team)
    const away   = resolveTeam(match.away_team)
    const pred   = predictions[match.id]
    const winner = pred === home || pred === away ? pred : null

    const canPick = (t: string) =>
      !isBracketLocked && !!t && t !== 'TBD' && !t.startsWith('W') && !t.startsWith('L')

    const borderClass = isFinal
      ? 'border-skyblue/70 shadow-[0_0_12px_rgba(100,175,230,0.25)]'
      : 'border-[#1E3A6E]'

    return (
      <div className={`flex flex-col h-full overflow-hidden rounded-lg border bg-[#071729] ${borderClass}`}>
        <button
          onClick={() => canPick(home) && handleSelect(match.id, home)}
          disabled={!canPick(home)}
          className={[
            'flex items-center w-full flex-1 px-2 border-b border-[#1E3A6E] text-[11px] font-medium transition-colors overflow-hidden',
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
            'flex items-center w-full flex-1 px-2 text-[11px] font-medium transition-colors overflow-hidden',
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

          {/* Column labels */}
          {COL_LABELS.map((label, ci) => (
            <div
              key={ci}
              className={`absolute top-0 flex items-center justify-center text-[9px] font-bold uppercase tracking-wider
                ${ci === 4 ? 'text-skyblue' : 'text-skyblue/50'}`}
              style={{ left: colX(ci), width: CW, height: LABEL_H }}
            >
              {ci === 4 ? '🏆' : label}
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
                opacity={0.28}
                strokeLinecap="round"
              />
            ))}
          </svg>

          {/* Match cards */}
          {nodes.map(({ match, x, y, isFinal }) => (
            <div
              key={match.id}
              className="absolute"
              style={{ left: x, top: y + LABEL_H, width: CW, height: CH }}
            >
              {renderCard(match, isFinal)}
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
