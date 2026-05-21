'use client'

import { useState, useTransition } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { acceptRules } from './accept-rules-action'

export default function RulesModal({ open }: { open: boolean }) {
  const [checked, setChecked] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!open) return null

  function handleAccept() {
    if (!checked) return
    startTransition(async () => {
      await acceptRules()
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-navy rounded-t-2xl px-6 py-5 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚽</span>
            <div>
              <p className="text-skyblue text-xs font-semibold uppercase tracking-widest">
                Quiniela Proyelec Internacional
              </p>
              <h2 className="text-white text-xl font-bold leading-tight">
                Normas de Participación
              </h2>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5 text-sm text-gray-700">

          <p className="text-gray-500 text-xs leading-relaxed">
            Lee las reglas con atención antes de participar. Una vez aceptadas, no podrás
            modificar tus predicciones pasados los plazos establecidos.
          </p>

          <section className="space-y-2">
            <h3 className="font-bold text-navy text-base">Participación</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600 leading-relaxed">
              <li>Solo empleados con correo <strong>@proyelec.com</strong> pueden participar.</li>
              <li>Un usuario por persona. Cuentas duplicadas serán eliminadas.</li>
              <li>Las predicciones son individuales — no se permiten colaboraciones.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-navy text-base">Plazos</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600 leading-relaxed">
              <li><strong>11 de junio 2026</strong> — cierre de predicciones de grupos y especiales.</li>
              <li><strong>~8 de julio 2026</strong> — apertura de la ventana de bracket eliminatorio.</li>
              <li><strong>~10 de julio 2026</strong> — cierre del bracket antes del primer 1/16.</li>
              <li>Partidos sin predecir cuentan como 0 puntos, sin penalización.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-navy text-base">Sistema de puntuación — Fase de grupos</h3>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-xs font-mono">
              <div className="flex justify-between"><span>Signo 1X2 correcto</span><span className="font-bold text-navy">+1 pt</span></div>
              <div className="flex justify-between"><span>Diferencia de goles exacta (con 1X2)</span><span className="font-bold text-navy">+1 pt</span></div>
              <div className="flex justify-between"><span>Resultado exacto</span><span className="font-bold text-navy">+3 pts</span></div>
              <div className="flex justify-between"><span>1° del grupo correcto</span><span className="font-bold text-navy">+2 pts</span></div>
              <div className="flex justify-between"><span>2° del grupo correcto</span><span className="font-bold text-navy">+1 pt</span></div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-navy text-base">Sistema de puntuación — Eliminatoria</h3>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-xs font-mono">
              <div className="flex justify-between"><span>1/16 — Ganador correcto</span><span className="font-bold text-navy">+2 pts</span></div>
              <div className="flex justify-between"><span>1/16 — Resultado exacto</span><span className="font-bold text-navy">+4 pts</span></div>
              <div className="flex justify-between"><span>Octavos — Ganador</span><span className="font-bold text-navy">+3 pts</span></div>
              <div className="flex justify-between"><span>Octavos — Resultado exacto</span><span className="font-bold text-navy">+6 pts</span></div>
              <div className="flex justify-between"><span>Cuartos — Ganador</span><span className="font-bold text-navy">+4 pts</span></div>
              <div className="flex justify-between"><span>Cuartos — Resultado exacto</span><span className="font-bold text-navy">+8 pts</span></div>
              <div className="flex justify-between"><span>Semis — Ganador</span><span className="font-bold text-navy">+5 pts</span></div>
              <div className="flex justify-between"><span>Semis — Resultado exacto</span><span className="font-bold text-navy">+10 pts</span></div>
              <div className="flex justify-between"><span>Campeón</span><span className="font-bold text-navy">+15 pts</span></div>
              <div className="flex justify-between"><span>Subcampeón</span><span className="font-bold text-navy">+8 pts</span></div>
              <div className="flex justify-between"><span>3er puesto</span><span className="font-bold text-navy">+5 pts</span></div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-navy text-base">Predicciones especiales</h3>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-xs font-mono">
              <div className="flex justify-between"><span>Bota de Oro (máximo goleador)</span><span className="font-bold text-navy">+10 pts</span></div>
              <div className="flex justify-between"><span>Balón de Oro (mejor jugador)</span><span className="font-bold text-navy">+8 pts</span></div>
              <div className="flex justify-between"><span>Guante de Oro (mejor portero)</span><span className="font-bold text-navy">+6 pts</span></div>
              <div className="flex justify-between"><span>Total de goles (±5 margen)</span><span className="font-bold text-navy">+5 pts</span></div>
              <div className="flex justify-between"><span>Jugador con más rojas</span><span className="font-bold text-navy">+4 pts</span></div>
              <div className="flex justify-between"><span>Partido con más goles</span><span className="font-bold text-navy">+6 pts</span></div>
              <div className="flex justify-between"><span>Equipo del gol más rápido</span><span className="font-bold text-navy">+5 pts</span></div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-navy text-base">Resultados y ranking</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600 leading-relaxed">
              <li>Los resultados se actualizan automáticamente vía API-Football.</li>
              <li>El ranking es acumulativo — los puntos de grupos se suman con los de eliminatoria.</li>
              <li>El ranking nunca se resetea durante el torneo.</li>
              <li>En caso de empate en puntos, se usa el orden alfabético del username.</li>
            </ul>
          </section>

        </div>

        {/* Footer — checkbox + button */}
        <div className="shrink-0 border-t border-gray-200 px-6 py-4 space-y-4 bg-gray-50 rounded-b-2xl">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5 shrink-0">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 transition-colors flex items-center justify-center
                ${checked ? 'bg-navy border-navy' : 'bg-white border-gray-300 group-hover:border-skyblue'}`}
              >
                {checked && <CheckCircle className="w-3.5 h-3.5 text-white" />}
              </div>
            </div>
            <span className="text-sm text-gray-700 leading-snug select-none">
              He leído y entiendo las normas de la quiniela. Quiero participar.
            </span>
          </label>

          <button
            onClick={handleAccept}
            disabled={!checked || isPending}
            className="w-full flex items-center justify-center gap-2 py-3 bg-navy text-white text-sm font-bold rounded-xl transition-all
              hover:bg-navy/90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</>
              : '¡Entendido, quiero participar!'}
          </button>
        </div>

      </div>
    </div>
  )
}
