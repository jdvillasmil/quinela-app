'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, AlertCircle } from 'lucide-react'

const inputClass =
  'w-full px-4 py-3 bg-black/25 border border-white/15 rounded-lg text-sm text-white ' +
  'placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-skyblue/50 ' +
  'focus:border-skyblue/60 transition-all duration-200 ' +
  '[&:-webkit-autofill]:shadow-[0_0_0_30px_#040d1c_inset] [&:-webkit-autofill]:[color-scheme:dark]'

const SUPABASE_ERROR_MAP: Record<string, string> = {
  'Email not confirmed': 'Debes verificar tu correo antes de entrar. Revisa tu bandeja de entrada.',
  'Invalid login credentials': 'Correo o contraseña incorrectos.',
}

function resolveAuthError(message: string): string {
  for (const [key, label] of Object.entries(SUPABASE_ERROR_MAP)) {
    if (message.includes(key)) return label
  }
  return 'Error al iniciar sesión. Intenta de nuevo.'
}

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Todos los campos son obligatorios.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (authError) {
      setError(resolveAuthError(authError.message))
      return
    }

    router.refresh()
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-navy relative flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Ambient glow */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-skyblue/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-skyblue/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_60%,rgba(0,0,0,0.3))]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Brand header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-[72px] h-[72px] rounded-2xl bg-white/6 border border-white/12 mb-4 shadow-lg shadow-black/30">
            <Image src="/favicon.png" alt="Proyelec" width={44} height={44} priority />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Quiniela</h1>
          <p className="text-skyblue text-sm font-semibold mt-1 tracking-wide">Mundial 2026</p>
          <p className="text-white/30 text-xs mt-1">Proyelec International</p>
        </div>

        {/* Card */}
        <div className="bg-[#071729] border border-[#1E3A6E]/60 rounded-2xl shadow-2xl shadow-black/40 px-8 py-7">
          <div className="h-px bg-gradient-to-r from-transparent via-skyblue/25 to-transparent mb-6" />

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nombre@proyelec.com"
                autoComplete="email"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className={inputClass}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/25 text-red-400 rounded-lg px-4 py-3 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-skyblue text-navy text-sm font-bold rounded-lg hover:bg-skyblue/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="h-px bg-white/6 my-5" />

          <p className="text-center text-sm text-gray-500">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-skyblue font-semibold hover:text-skyblue/80 transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
