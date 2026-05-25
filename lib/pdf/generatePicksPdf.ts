import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Match, Prediction, SpecialPrediction } from '@/types'
import { teamEs } from '@/lib/i18n/teams'

export interface MatchWithPrediction extends Match {
  prediction: Pick<Prediction, 'predicted_home' | 'predicted_away'> | null
}

export interface GroupData {
  [group: string]: MatchWithPrediction[]
}

// ─── Colors ───────────────────────────────────────────────────────────────────

const NAVY: [number, number, number]     = [0,   32,  94]
const SKYBLUE: [number, number, number]  = [100, 175, 230]
const WHITE: [number, number, number]    = [255, 255, 255]
const LIGHT_BG: [number, number, number] = [244, 247, 253]
const DARK_TXT: [number, number, number] = [40,  40,  40]
const MID_TXT: [number, number, number]  = [130, 130, 130]
const QUAL_BG: [number, number, number]  = [224, 239, 252]
const HDR_DK: [number, number, number]   = [10,  28,  65]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDateLine(dateStr: string): string {
  const d = new Date(dateStr)
  const date = d.toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    weekday: 'short', day: 'numeric', month: 'short',
  })
  const time = d.toLocaleTimeString('es-CO', {
    timeZone: 'America/Bogota',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
  return `${date}\n${time}`
}

interface TeamStats {
  team: string
  played: number; won: number; drawn: number; lost: number
  goalsFor: number; goalsAgainst: number; points: number
}

function computeStandings(matches: MatchWithPrediction[]): TeamStats[] {
  const stats: Record<string, TeamStats> = {}

  for (const m of matches) {
    for (const t of [m.home_team, m.away_team]) {
      if (!stats[t]) stats[t] = { team: t, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
    }
    if (!m.prediction) continue
    const h = m.prediction.predicted_home
    const a = m.prediction.predicted_away
    stats[m.home_team].played++; stats[m.away_team].played++
    stats[m.home_team].goalsFor    += h; stats[m.home_team].goalsAgainst += a
    stats[m.away_team].goalsFor    += a; stats[m.away_team].goalsAgainst += h
    if      (h > a) { stats[m.home_team].won++;   stats[m.home_team].points += 3; stats[m.away_team].lost++  }
    else if (h < a) { stats[m.away_team].won++;   stats[m.away_team].points += 3; stats[m.home_team].lost++  }
    else            { stats[m.home_team].drawn++;  stats[m.home_team].points++;    stats[m.away_team].drawn++; stats[m.away_team].points++ }
  }

  return Object.values(stats).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    const gdDiff = (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst)
    if (gdDiff !== 0) return gdDiff
    return b.goalsFor - a.goalsFor
  })
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function generatePicksPdf(
  groupData: GroupData,
  groups: string[],
  specialPrediction: SpecialPrediction | null,
  username: string,
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const ML = 14

  let y = 0
  let firstPage = true

  const exportDate = new Date().toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    day: '2-digit', month: 'long', year: 'numeric',
  })

  // ── Page header ─────────────────────────────────────────────────────────────

  function addHeader() {
    doc.setFillColor(...NAVY)
    doc.rect(0, 0, pageW, 20, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(...WHITE)
    doc.text('PROYELEC', ML, 13)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(180, 210, 240)
    doc.text('Mis Predicciones · Mundial 2026', ML + 36, 13)

    doc.setFontSize(8.5)
    doc.setTextColor(200, 220, 245)
    doc.text(`@${username}`, pageW - ML, 13, { align: 'right' })

    y = 26

    if (firstPage) {
      doc.setFontSize(7.5)
      doc.setTextColor(...MID_TXT)
      doc.text(`Exportado el ${exportDate}`, pageW - ML, y, { align: 'right' })
      y += 7
      firstPage = false
    }
  }

  function maybeBreak(needed: number) {
    if (y + needed > pageH - 14) { doc.addPage(); addHeader() }
  }

  addHeader()

  // ── Groups ───────────────────────────────────────────────────────────────────

  for (const group of groups) {
    const matches = groupData[group]

    maybeBreak(55)

    // Section label bar
    doc.setFillColor(...NAVY)
    doc.roundedRect(ML, y, pageW - ML * 2, 7, 1.5, 1.5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...WHITE)
    doc.text(`GRUPO ${group}`, ML + 3, y + 4.9)
    y += 9

    // Matches table
    const matchRows = matches.map((m) => {
      const pred = m.prediction
      const score = pred !== null ? `${pred.predicted_home} − ${pred.predicted_away}` : '— − —'
      return [fmtDateLine(m.match_date), teamEs(m.home_team), score, teamEs(m.away_team)]
    })

    autoTable(doc, {
      startY: y,
      margin: { left: ML, right: ML },
      head: [['Fecha · Hora', 'Local', 'Marcador', 'Visitante']],
      body: matchRows,
      theme: 'plain',
      tableLineColor: [210, 220, 238],
      tableLineWidth: 0.15,
      styles: {
        fontSize: 7.5,
        cellPadding: { top: 2, bottom: 2, left: 2.5, right: 2.5 },
        textColor: DARK_TXT,
        lineColor: [210, 220, 238],
        lineWidth: 0.1,
      },
      headStyles: { fillColor: HDR_DK, textColor: SKYBLUE, fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: LIGHT_BG },
      columnStyles: {
        0: { cellWidth: 34 },
        1: { cellWidth: 60, fontStyle: 'bold' },
        2: { cellWidth: 22, halign: 'center', fontStyle: 'bold', textColor: NAVY },
        3: { fontStyle: 'bold' },
      },
    })

    y = (doc as any).lastAutoTable.finalY + 4

    // Standings sub-header
    maybeBreak(38)
    doc.setFillColor(...SKYBLUE)
    doc.rect(ML, y, pageW - ML * 2, 5.5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...NAVY)
    doc.text(`Clasificación · Grupo ${group}`, ML + 2.5, y + 3.8)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(0, 55, 130)
    doc.text('calculada con tus predicciones', pageW - ML - 2.5, y + 3.8, { align: 'right' })
    y += 7

    // Standings table
    const standings = computeStandings(matches)
    const standingRows = standings.map((s, i) => {
      const gd = s.goalsFor - s.goalsAgainst
      return [
        `${i + 1}`,
        teamEs(s.team),
        `${s.played}`, `${s.won}`, `${s.drawn}`, `${s.lost}`,
        `${s.goalsFor}`, `${s.goalsAgainst}`,
        gd >= 0 ? `+${gd}` : `${gd}`,
        `${s.points}`,
      ]
    })

    autoTable(doc, {
      startY: y,
      margin: { left: ML, right: ML },
      head: [['#', 'Equipo', 'PJ', 'G', 'E', 'P', 'GF', 'GC', 'DG', 'Pts']],
      body: standingRows,
      theme: 'plain',
      tableLineColor: [210, 220, 238],
      tableLineWidth: 0.15,
      styles: {
        fontSize: 7.5,
        cellPadding: { top: 1.8, bottom: 1.8, left: 2, right: 2 },
        textColor: DARK_TXT,
        lineColor: [210, 220, 238],
        lineWidth: 0.1,
      },
      headStyles: { fillColor: HDR_DK, textColor: SKYBLUE, fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: LIGHT_BG },
      columnStyles: {
        0: { cellWidth: 8,  halign: 'center' },
        // column 1 (Equipo): auto fills remaining space
        2: { cellWidth: 11, halign: 'center' },
        3: { cellWidth: 11, halign: 'center' },
        4: { cellWidth: 11, halign: 'center' },
        5: { cellWidth: 11, halign: 'center' },
        6: { cellWidth: 11, halign: 'center' },
        7: { cellWidth: 11, halign: 'center' },
        8: { cellWidth: 12, halign: 'center' },
        9: { cellWidth: 12, halign: 'center', fontStyle: 'bold', textColor: NAVY },
      },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.row.index < 2) {
          data.cell.styles.fillColor = QUAL_BG
        }
      },
    })

    y = (doc as any).lastAutoTable.finalY + 10
  }

  // ── Special Predictions ──────────────────────────────────────────────────────

  if (specialPrediction) {
    maybeBreak(75)

    doc.setFillColor(...NAVY)
    doc.roundedRect(ML, y, pageW - ML * 2, 7, 1.5, 1.5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...WHITE)
    doc.text('PREMIOS ESPECIALES', ML + 3, y + 4.9)
    y += 9

    const sp = specialPrediction
    const specialRows = [
      ['Balón de Oro — Mejor Jugador',           sp.best_player          || '—'],
      ['Bota de Oro — Máximo Goleador',          sp.top_scorer           || '—'],
      ['Guante de Oro — Mejor Portero',          sp.best_keeper          || '—'],
      ['Total de goles del torneo (±5 goles)',   sp.total_goals?.toString() || '—'],
      ['Jugador con más tarjetas rojas',         sp.most_red_cards       || '—'],
      ['Partido con más goles',                  sp.most_goals_match     || '—'],
      ['Equipo del gol más rápido',              sp.fastest_goal_team    || '—'],
    ]

    autoTable(doc, {
      startY: y,
      margin: { left: ML, right: ML },
      body: specialRows,
      theme: 'plain',
      tableLineColor: [210, 220, 238],
      tableLineWidth: 0.15,
      styles: {
        fontSize: 8.5,
        cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
        textColor: DARK_TXT,
        lineColor: [210, 220, 238],
        lineWidth: 0.1,
      },
      alternateRowStyles: { fillColor: LIGHT_BG },
      columnStyles: {
        0: { cellWidth: 92, fontStyle: 'bold', textColor: NAVY },
        1: { textColor: DARK_TXT },
      },
    })
  }

  // ── Footer on every page ─────────────────────────────────────────────────────

  const totalPages = (doc as any).internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setDrawColor(200, 215, 240)
    doc.setLineWidth(0.2)
    doc.line(ML, pageH - 11, pageW - ML, pageH - 11)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...MID_TXT)
    doc.text('Quiniela Proyelec International', ML, pageH - 7)
    doc.text(`${p} / ${totalPages}`, pageW - ML, pageH - 7, { align: 'right' })
  }

  doc.save(`picks-mundial-2026-${username}.pdf`)
}
