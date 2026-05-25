'use client'

import { useState, useTransition } from 'react'
import { Check, X, CheckCircle, AlertCircle, ChevronLeft } from 'lucide-react'
import type { SpecialPrediction } from '@/types'
import { saveSpecialPoints } from './actions'

// ─── Field config ─────────────────────────────────────────────────────────────

type FieldKey = keyof Pick<
  SpecialPrediction,
  'best_player' | 'top_scorer' | 'best_keeper' | 'total_goals' | 'fastest_goal_team'
>

const FIELDS: Array<{ key: FieldKey; label: string; pts: number; type: 'text' | 'number' }> = [
  { key: 'best_player',       label: 'Balón de Oro',            pts: 8,  type: 'text'   },
  { key: 'top_scorer',        label: 'Bota de Oro',             pts: 10, type: 'text'   },
  { key: 'best_keeper',       label: 'Guante de Oro',           pts: 6,  type: 'text'   },
  { key: 'total_goals',       label: 'Total de Goles (±5)',     pts: 5,  type: 'number' },
  { key: 'fastest_goal_team', label: 'Gol más Rápido',          pts: 5,  type: 'text'   },
]

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserWithSpecial = {
  id: string
  username: string
  first_name: string
  last_name: string
  special: SpecialPrediction | null
}

interface Props {
  users: UserWithSpecial[]
}

// ─── Approval cell ────────────────────────────────────────────────────────────

function ApprovalCell({
  answer,
  approval,
  onApprove,
  onReject,
}: {
  answer: string
  approval: boolean | undefined
  onApprove: () => void
  onReject: () => void
}) {
  return (
    <div
      className={`rounded-lg p-2 border transition-colors ${
        approval === true  ? 'bg-emerald-50 border-emerald-200' :
        approval === false ? 'bg-red-50    border-red-200'      :
                             'bg-gray-50   border-gray-200'
      }`}
    >
      <p className="text-xs text-gray-700 mb-1.5 min-h-[1rem] break-words">
        {answer || <span className="text-gray-300 italic">—</span>}
      </p>
      <div className="flex gap-1">
        <button
          onClick={onApprove}
          className={`flex-1 flex items-center justify-center py-1 rounded text-xs font-bold transition-all cursor-pointer ${
            approval === true
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-100 text-gray-400 hover:bg-emerald-100 hover:text-emerald-600'
          }`}
          title="Aprobar"
        >
          <Check className="w-3 h-3" />
        </button>
        <button
          onClick={onReject}
          className={`flex-1 flex items-center justify-center py-1 rounded text-xs font-bold transition-all cursor-pointer ${
            approval === false
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600'
          }`}
          title="Rechazar"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminSpecialsClient({ users }: Props) {
  const [correctAnswers, setCorrectAnswers] = useState<Record<FieldKey, string>>(
    () => Object.fromEntries(FIELDS.map((f) => [f.key, ''])) as Record<FieldKey, string>
  )

  // approvals[userId][fieldKey] = true | false | undefined (undecided)
  const [approvals, setApprovals] = useState<Record<string, Partial<Record<FieldKey, boolean>>>>({})

  const [showSummary, setShowSummary] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  function setApproval(userId: string, field: FieldKey, value: boolean) {
    setApprovals((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value },
    }))
  }

  function calcUserPts(userId: string): number {
    const ua = approvals[userId] ?? {}
    return FIELDS.reduce((sum, f) => sum + (ua[f.key] === true ? f.pts : 0), 0)
  }

  const usersWithSpecial = users.filter((u) => u.special !== null)

  function handleCalculate() {
    setShowSummary(true)
    setTimeout(() => {
      document.getElementById('summary-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  function handleConfirm() {
    const updates = usersWithSpecial.map((u) => ({
      user_id: u.id,
      points_earned: calcUserPts(u.id),
    }))

    startTransition(async () => {
      const res = await saveSpecialPoints(updates)
      setResult(res)
      if (res.success) setShowSummary(false)
    })
  }

  return (
    <div className="space-y-6 pb-12">
      <h1 className="text-2xl font-bold text-navy">Predicciones Especiales</h1>

      {result && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 text-sm font-medium ${
            result.success
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}
        >
          {result.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {result.message}
        </div>
      )}

      {/* ── Section 1: Correct answers ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-navy uppercase tracking-wide">
            Respuestas Correctas del Torneo
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Usa estos campos como referencia mientras revisas las respuestas de cada usuario.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                {f.label}{' '}
                <span className="text-skyblue font-bold">+{f.pts} pts</span>
              </label>
              <input
                type={f.type}
                value={correctAnswers[f.key]}
                onChange={(e) =>
                  setCorrectAnswers((prev) => ({ ...prev, [f.key]: e.target.value }))
                }
                placeholder="Respuesta correcta…"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-skyblue/40 focus:border-skyblue transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: User table ───────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-navy uppercase tracking-wide">
            Respuestas de Usuarios
          </h2>
          <span className="text-xs text-gray-400 shrink-0">
            {usersWithSpecial.length} de {users.length} respondieron
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap sticky left-0 bg-gray-50 z-10 shadow-[2px_0_4px_rgba(0,0,0,0.04)]">
                  Usuario
                </th>
                {FIELDS.map((f) => (
                  <th
                    key={f.key}
                    className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[150px]"
                  >
                    {f.label}
                    <span className="block text-skyblue font-bold normal-case tracking-normal mt-0.5">
                      +{f.pts} pts
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Pts calc.
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={FIELDS.length + 2}
                    className="px-4 py-12 text-center text-gray-400 text-sm"
                  >
                    Ningún usuario ha enviado predicciones especiales.
                  </td>
                </tr>
              )}
              {users.map((user) => {
                const sp = user.special
                const userPts = calcUserPts(user.id)
                const approvedCount = FIELDS.filter(
                  (f) => approvals[user.id]?.[f.key] === true
                ).length

                return (
                  <tr key={user.id} className="hover:bg-gray-50/70 transition-colors align-top">
                    {/* Username — sticky */}
                    <td className="px-4 py-3 sticky left-0 bg-white z-10 shadow-[2px_0_4px_rgba(0,0,0,0.04)]">
                      <p className="font-semibold text-navy whitespace-nowrap">{user.username}</p>
                      <p className="text-xs text-gray-400 whitespace-nowrap">
                        {user.first_name} {user.last_name}
                      </p>
                      {sp && approvedCount > 0 && (
                        <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
                          {approvedCount}/{FIELDS.length} aprobados
                        </span>
                      )}
                    </td>

                    {/* Field cells */}
                    {FIELDS.map((f) => {
                      const raw = sp ? sp[f.key] : null
                      const answer = raw !== null && raw !== undefined ? String(raw) : ''
                      return (
                        <td key={f.key} className="px-3 py-3">
                          {sp ? (
                            <ApprovalCell
                              answer={answer}
                              approval={approvals[user.id]?.[f.key]}
                              onApprove={() => setApproval(user.id, f.key, true)}
                              onReject={() => setApproval(user.id, f.key, false)}
                            />
                          ) : (
                            <span className="text-xs text-gray-300 italic">Sin respuesta</span>
                          )}
                        </td>
                      )
                    })}

                    {/* Calculated points */}
                    <td className="px-4 py-3 text-center align-middle">
                      <span
                        className={`text-xl font-bold tabular-nums ${
                          userPts > 0 ? 'text-navy' : 'text-gray-200'
                        }`}
                      >
                        {userPts}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleCalculate}
            className="px-6 py-2.5 bg-navy text-white text-sm font-bold rounded-lg hover:bg-navy/90 transition-colors shadow-sm cursor-pointer"
          >
            Calcular y guardar puntos →
          </button>
        </div>
      </div>

      {/* ── Section 3: Summary + confirm ───────────────────────────────────── */}
      {showSummary && (
        <div id="summary-section" className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-navy uppercase tracking-wide">
              Resumen de puntos a asignar
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Revisa los totales antes de confirmar. Esta acción sobrescribe los puntos especiales actuales.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Pts especiales actuales
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-navy uppercase tracking-wide">
                    Pts a guardar
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Campos aprobados
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usersWithSpecial.map((u) => {
                  const newPts = calcUserPts(u.id)
                  const currentPts = u.special!.points_earned
                  const approvedCount = FIELDS.filter(
                    (f) => approvals[u.id]?.[f.key] === true
                  ).length
                  const changed = newPts !== currentPts

                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-semibold text-navy">{u.username}</td>
                      <td className="px-6 py-3 text-center text-gray-400 tabular-nums">
                        {currentPts}
                      </td>
                      <td className="px-6 py-3 text-center tabular-nums">
                        <span
                          className={`text-lg font-bold ${
                            newPts > 0 ? 'text-navy' : 'text-gray-300'
                          }`}
                        >
                          {newPts}
                        </span>
                        {changed && (
                          <span
                            className={`ml-2 text-xs font-semibold ${
                              newPts > currentPts ? 'text-emerald-500' : 'text-red-400'
                            }`}
                          >
                            {newPts > currentPts ? `+${newPts - currentPts}` : newPts - currentPts}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-center text-gray-500">
                        {approvedCount} / {FIELDS.length}
                      </td>
                    </tr>
                  )
                })}
                {usersWithSpecial.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-sm">
                      Ningún usuario ha enviado predicciones especiales.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4">
            <button
              onClick={() => setShowSummary(false)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver a revisar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isPending || usersWithSpecial.length === 0}
              className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              {isPending ? 'Guardando…' : 'Confirmar y guardar puntos'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
