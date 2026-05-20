'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const inputClass =
  'w-full px-3 py-2.5 border border-[#CCCCCC] rounded-element text-sm text-gray-800 ' +
  'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-skyblue ' +
  'focus:border-transparent transition'

const SUPABASE_ERROR_MAP: Record<string, string> = {
  'Email not confirmed': 'Verifica tu correo antes de iniciar sesión.',
  'Invalid login credentials': 'Correo o contraseña incorrectos.',
}

function resolveAuthError(message: string): string {
  for (const [key, label] of Object.entries(SUPABASE_ERROR_MAP)) {
    if (message.includes(key)) return label
  }
  return 'Error al iniciar sesión. Intenta de nuevo.'
}

interface Props {
  urlError?: string
}

export default function LoginForm({ urlError }: Props) {
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
    <main className="min-h-screen bg-navy flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-card shadow-2xl w-full max-w-sm p-8">

        {/* Brand */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">⚽</div>
          <h1 className="text-2xl font-semibold text-navy tracking-wide">QUINIELA</h1>
          <p className="text-skyblue text-sm font-medium mt-0.5">Mundial 2026</p>
          <p className="text-[#444444] text-xs mt-1">Proyelec International</p>
        </div>

        <div className="border-t border-[#CCCCCC] mb-6" />

        {/* URL error (callback failure) */}
        {urlError === 'link_expirado' && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-element px-4 py-3 text-xs mb-5">
            El enlace de verificación expiró o ya fue utilizado. Regístrate de nuevo si es necesario.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-[#444444] mb-1.5">
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
            <label htmlFor="password" className="block text-xs font-medium text-[#444444] mb-1.5">
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
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-element px-4 py-3 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-navy text-white text-sm font-semibold rounded-element hover:bg-navy/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-sm text-[#444444] mt-6">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-skyblue font-medium hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </main>
  )
}
