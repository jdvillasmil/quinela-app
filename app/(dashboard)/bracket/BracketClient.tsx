'use client'

import { useState, useTransition, useMemo } from 'react'
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
const PAD = 50    // canvas padding (extra left space for score badges)
const LABEL_H = 24

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

type ScorePair = { home: number | ''; away: number | '' }

function winRef(s: string | null | undefined): number | null {
  if (!s || !s.startsWith('W')) return null
  const n = parseInt(s.slice(1), 10)
  return isNaN(n) ? null : n
}

function getMatchResultClass(match: Match, s: ScorePair): 'green' | 'yellow' | 'red' | 'none' {
  if (match.status !== 'finished' || match.home_score == null || match.away_score == null) return 'none'
  if (s.home === '' || s.away === '') return 'red'
  const ph = s.home as number, pa = s.away as number
  const rh = match.home_score, ra = match.away_score
  if (ph === rh && pa === ra) return 'green'
  const ps = Math.sign(ph - pa), rs = Math.sign(rh - ra)
  if (ps === rs || (ph - pa) === (rh - ra)) return 'yellow'
  return 'red'
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

  const leftR32  = r32All.slice(0, 8)
  const rightR32 = r32All.slice(8)
  const leftR16  = r16All.slice(0, 4)
  const rightR16 = r16All.slice(4)
  const leftQF   = qfAll.slice(0, 2)
  const rightQF  = qfAll.slice(2)
  const leftSF   = sfAll[0]
  const rightSF  = sfAll[1]

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

  const edges: SVGEdge[] = []

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

  leftEdges(leftR16, 1)
  leftEdges(leftQF, 2)
  leftEdges([leftSF], 3)

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
  const [scores, setScores] = useState<Record<number, ScorePair>>(() => {
    const map: Record<number, ScorePair> = {}
    for (const p of initialPredictions) {
      map[p.match_id] = {
        home: p.predicted_home ?? '',
        away: p.predicted_away ?? '',
      }
    }
    return map
  })
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; message: string; saved?: number; skipped?: number } | null>(null)

  // Regular function (not useCallback) so recursive calls always read the
  // current render's scores/initialMatches without any stale-closure risk.
  function resolveTeam(teamStr: string): string {
    if (!teamStr) return 'TBD'

    if (teamStr.startsWith('W')) {
      const n = parseInt(teamStr.slice(1), 10)
      const m = initialMatches.find(x => x.match_number === n)
      if (m) {
        // Actual finished result takes priority
        if (m.status === 'finished' && m.home_score != null && m.away_score != null) {
          if (m.home_score > m.away_score) return resolveTeam(m.home_team)
          if (m.away_score > m.home_score) return resolveTeam(m.away_team)
          // Draw (penalties) — use admin-set knockout_winner for propagation
          if (m.knockout_winner) return resolveTeam(m.knockout_winner)
          return 'TBD'
        }
        // Fall back to user's predicted score for visual bracket feedback
        const s = scores[m.id]
        if (s && s.home !== '' && s.away !== '' && (s.home as number) !== (s.away as number)) {
          return (s.home as number) > (s.away as number)
            ? resolveTeam(m.home_team)
            : resolveTeam(m.away_team)
        }
      }
      return 'TBD'
    }

    if (teamStr.startsWith('L')) {
      const n = parseInt(teamStr.slice(1), 10)
      const m = initialMatches.find(x => x.match_number === n)
      if (m) {
        if (m.status === 'finished' && m.home_score != null && m.away_score != null) {
          if (m.home_score > m.away_score) return resolveTeam(m.away_team)
          if (m.away_score > m.home_score) return resolveTeam(m.home_team)
          // Draw (penalties) — loser is whoever isn't the knockout_winner
          if (m.knockout_winner) {
            const winner = resolveTeam(m.knockout_winner)
            const h = resolveTeam(m.home_team)
            const a = resolveTeam(m.away_team)
            return h === winner ? a : h
          }
          return 'TBD'
        }
        const s = scores[m.id]
        if (s && s.home !== '' && s.away !== '' && (s.home as number) !== (s.away as number)) {
          return (s.home as number) > (s.away as number)
            ? resolveTeam(m.away_team)
            : resolveTeam(m.home_team)
        }
      }
      return 'TBD'
    }

    return teamStr
  }

  const handleScoreChange = (matchId: number, side: 'home' | 'away', value: string) => {
    const num = value === '' ? '' : Math.max(0, parseInt(value, 10) || 0)
    setScores(prev => ({
      ...prev,
      [matchId]: { ...(prev[matchId] ?? { home: '', away: '' }), [side]: num },
    }))
    setResult(null)
  }

  const handleSave = () => {
    const payload = initialMatches
      .map(m => {
        const s = scores[m.id]
        if (!s || s.home === '' || s.away === '') return null
        return { match_id: m.id, predicted_home: s.home as number, predicted_away: s.away as number }
      })
      .filter(Boolean) as { match_id: number; predicted_home: number; predicted_away: number }[]

    startTransition(async () => {
      const res = await saveBracketPredictions(payload)
      if (!res.success) console.error('[bracket] saveBracketPredictions failed:', res)
      setResult(res)
    })
  }

  const { nodes, edges, svgW, svgH, third } = useMemo(
    () => computeLayout(initialMatches),
    [initialMatches]
  )

  // ── Card renderer ─────────────────────────────────────────────────────────
  const renderCard = (match: Match, isFinal = false) => {
    const home = resolveTeam(match.home_team)
    const away = resolveTeam(match.away_team)
    const s = scores[match.id] ?? { home: '', away: '' }

    const isR32 = match.phase === 'r32'
    const isEditable = isR32 &&
      match.status === 'scheduled' &&
      new Date(match.match_date) > new Date()
    const hasPred = s.home !== '' && s.away !== ''

    let borderClass: string
    if (isFinal) {
      borderClass = 'border-skyblue/70 shadow-[0_0_12px_rgba(100,175,230,0.25)]'
    } else if (isR32 && match.status === 'finished' && match.home_score != null) {
      const rc = getMatchResultClass(match, s)
      borderClass = rc === 'green'
        ? 'border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
        : rc === 'yellow'
        ? 'border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
        : rc === 'red'
        ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
        : 'border-[#1E3A6E]'
    } else {
      borderClass = 'border-[#1E3A6E]'
    }

    const rowBase = 'flex items-center flex-1 px-1.5 gap-1'
    const teamLabel = `w-[84px] min-w-0 truncate text-[10px] font-medium ${isR32 ? 'text-gray-300' : 'text-gray-500 italic'}`

    if (!isR32) {
      return (
        <div className={`flex flex-col h-full overflow-hidden rounded-lg border bg-[#071729]/60 ${borderClass} opacity-60`}>
          <div className={`${rowBase} border-b border-[#1E3A6E]`}>
            <span className={teamLabel}>{home === 'TBD' ? '—' : teamEs(home)}</span>
          </div>
          <div className={rowBase}>
            <span className={teamLabel}>{away === 'TBD' ? '—' : teamEs(away)}</span>
          </div>
        </div>
      )
    }

    const inputCls =
      'w-7 shrink-0 text-center text-[11px] font-bold bg-[#0D1F3C] border border-[#1E3A6E] rounded text-skyblue focus:outline-none focus:border-skyblue disabled:opacity-40 disabled:cursor-not-allowed'

    return (
      <div className={`flex flex-col h-full overflow-hidden rounded-lg border bg-[#071729] ${borderClass}`}>
        <div className={`${rowBase} border-b border-[#1E3A6E] ${hasPred ? 'bg-skyblue/10' : ''}`}>
          <span className={teamLabel}>{teamEs(home)}</span>
          <input
            type="number"
            min={0}
            max={99}
            value={s.home}
            disabled={!isEditable}
            onChange={e => handleScoreChange(match.id, 'home', e.target.value)}
            className={inputCls}
          />
        </div>
        <div className={`${rowBase} ${hasPred ? 'bg-skyblue/10' : ''}`}>
          <span className={teamLabel}>{teamEs(away)}</span>
          <input
            type="number"
            min={0}
            max={99}
            value={s.away}
            disabled={!isEditable}
            onChange={e => handleScoreChange(match.id, 'away', e.target.value)}
            className={inputCls}
          />
        </div>
      </div>
    )
  }

  const canvasH = svgH + LABEL_H

  const r32Matches = initialMatches.filter(m => m.phase === 'r32')
  const editableCount = r32Matches.filter(m =>
    m.status === 'scheduled' && new Date(m.match_date) > new Date()
  ).length
  const finishedR32 = r32Matches.filter(m => m.status === 'finished').length
  const footerStatus = editableCount > 0
    ? `${editableCount} cruce${editableCount !== 1 ? 's' : ''} aún sin iniciar — guarda tu bracket`
    : finishedR32 === r32Matches.length && r32Matches.length > 0
    ? 'Todos los cruces de 1/16 completados'
    : finishedR32 > 0
    ? `${finishedR32} de ${r32Matches.length} cruces de 1/16 completados`
    : 'El bracket está en progreso'

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Bracket Eliminatorio</h1>
        <p className="text-sm text-gray-400 mt-1">
          Ingresa el marcador predicho para cada cruce. Los partidos se bloquean al iniciar.
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

          {/* Official score badges to the left of finished R32 cards */}
          {nodes
            .filter(({ match }) => match.phase === 'r32' && match.status === 'finished' && match.home_score != null)
            .map(({ match, x, y }) => (
              <div
                key={`score-${match.id}`}
                className="absolute flex items-center justify-center"
                style={{ left: x - GX, top: y + LABEL_H, width: GX, height: CH }}
              >
                <span className="text-[9px] font-bold text-white/50 whitespace-nowrap">
                  {match.home_score}–{match.away_score}
                </span>
              </div>
            ))}

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
      <div className="fixed bottom-[80px] sm:bottom-0 left-0 right-0 bg-[#071729] border-t border-[#1E3A6E]/60 p-4 shadow-lg z-40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex-1">
            {result ? (() => {
              const isPartial = result.success && (result.skipped ?? 0) > 0
              const colorClass = !result.success
                ? 'text-red-400'
                : isPartial
                ? 'text-amber-400'
                : 'text-emerald-400'
              const Icon = result.success && !isPartial ? CheckCircle : AlertCircle
              return (
                <div className={`flex items-center gap-2 text-sm font-medium ${colorClass}`}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {result.message}
                </div>
              )
            })() : (
              <p className="text-xs text-gray-500">{footerStatus}</p>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center justify-center gap-2 px-6 py-2.5 w-full sm:w-auto bg-skyblue text-navy text-sm font-bold rounded-lg hover:bg-skyblue/90 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isPending ? 'Guardando...' : 'Guardar Bracket Completo'}
          </button>
        </div>
      </div>
    </div>
  )
}
