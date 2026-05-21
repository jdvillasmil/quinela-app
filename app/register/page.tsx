'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

const inputClass =
  'w-full px-4 py-3 bg-black/25 border border-white/15 rounded-lg text-sm text-white ' +
  'placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-skyblue/50 ' +
  'focus:border-skyblue/60 transition-all duration-200 ' +
  '[&:-webkit-autofill]:shadow-[0_0_0_30px_#040d1c_inset] [&:-webkit-autofill]:[color-scheme:dark]'

const labelClass = 'block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2'

const SUPABASE_ERROR_MAP: Record<string, string> = {
  'already registered': 'Este correo ya está registrado.',
  'User already registered': 'Este correo ya está registrado.',
}

function resolveAuthError(message: string): string {
  for (const [key, label] of Object.entries(SUPABASE_ERROR_MAP)) {
    if (message.includes(key)) return label
  }
  return 'Error al crear la cuenta. Intenta de nuevo.'
}

interface FormState {
  email: string
  firstName: string
  lastName: string
  username: string
  password: string
  confirmPassword: string
}

const EMPTY_FORM: FormState = {
  email: '',
  firstName: '',
  lastName: '',
  username: '',
  password: '',
  confirmPassword: '',
}

function validate(form: FormState): string {
  if (Object.values(form).some(v => !v.trim())) return 'Todos los campos son obligatorios.'
  if (!form.email.toLowerCase().endsWith('@proyelec.com'))
    return 'Solo se permiten correos con dominio @proyelec.com.'
  if (!/^[a-z0-9_]{3,20}$/.test(form.username))
    return 'El usuario solo puede tener letras minúsculas, números y _ (3–20 caracteres).'
  if (form.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
  if (form.password !== form.confirmPassword) return 'Las contraseñas no coinciden.'
  return ''
}

export default function RegisterPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successEmail, setSuccessEmail] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const validationError = validate(form)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          username: form.username,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setLoading(false)

    if (authError) {
      setError(resolveAuthError(authError.message))
      return
    }

    setSuccessEmail(form.email)
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (successEmail) {
    return (
      <main className="min-h-screen bg-navy relative flex items-center justify-center px-4 py-12 overflow-hidden">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-skyblue/6 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-sm">
          <div className="bg-[#071729] border border-[#1E3A6E]/60 rounded-2xl shadow-2xl shadow-black/40 p-8 text-center">
            <div className="h-px bg-gradient-to-r from-transparent via-skyblue/25 to-transparent mb-6" />
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">¡Revisa tu correo!</h2>
            <p className="text-sm text-gray-400">Enviamos un enlace de verificación a</p>
            <p className="text-sm font-bold text-skyblue mt-1 mb-4 break-all">{successEmail}</p>
            <p className="text-xs text-gray-500 mb-7 leading-relaxed">
              Haz clic en el enlace para activar tu cuenta.
              Puede tardar unos minutos — revisa también tu carpeta de spam.
            </p>
            <Link
              href="/login"
              className="block w-full py-3 bg-skyblue text-navy text-sm font-bold rounded-lg hover:bg-skyblue/90 transition-colors text-center cursor-pointer"
            >
              Ir al inicio de sesión
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // ── Register form ──────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-navy relative flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div aria-hidden className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-skyblue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-skyblue/4 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm my-4">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-[64px] h-[64px] rounded-2xl bg-white/6 border border-white/12 mb-4 shadow-lg shadow-black/30">
            <Image src="/favicon.png" alt="Proyelec" width={38} height={38} priority />
          </div>
          <h1 className="text-xl font-bold text-white tracking-widest uppercase">Quiniela</h1>
          <p className="text-skyblue text-xs font-semibold mt-1 tracking-wide">
            Mundial 2026 · Proyelec International
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#071729] border border-[#1E3A6E]/60 rounded-2xl shadow-2xl shadow-black/40 px-8 py-7">
          <div className="h-px bg-gradient-to-r from-transparent via-skyblue/25 to-transparent mb-5" />

          <h2 className="text-sm font-bold text-white mb-5 uppercase tracking-wider">Crear cuenta</h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-3">

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelClass}>Correo electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="nombre@proyelec.com"
                autoComplete="email"
                className={inputClass}
              />
              <p className="text-[10px] text-gray-600 mt-1">Solo correos @proyelec.com</p>
            </div>

            {/* Nombre + Apellido */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className={labelClass}>Nombre</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Juan"
                  autoComplete="given-name"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="lastName" className={labelClass}>Apellido</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Pérez"
                  autoComplete="family-name"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className={labelClass}>Usuario</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm select-none">@</span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="juan_perez"
                  autoComplete="username"
                  className={`${inputClass} pl-8`}
                />
              </div>
              <p className="text-[10px] text-gray-600 mt-1">
                Letras minúsculas, números y _ · 3–20 caracteres
              </p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={labelClass}>Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                className={inputClass}
              />
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" className={labelClass}>Confirmar contraseña</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="new-password"
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
              className="w-full py-3 mt-1 bg-skyblue text-navy text-sm font-bold rounded-lg hover:bg-skyblue/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>

          <div className="h-px bg-white/6 my-5" />

          <p className="text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-skyblue font-semibold hover:text-skyblue/80 transition-colors">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
