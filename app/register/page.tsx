'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const inputClass =
  'w-full px-3 py-2.5 border border-[#CCCCCC] rounded-element text-sm text-gray-800 ' +
  'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-skyblue ' +
  'focus:border-transparent transition'
const labelClass = 'block text-xs font-medium text-[#444444] mb-1.5'

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
      <main className="min-h-screen bg-navy flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-card shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-navy mb-2">¡Revisa tu correo!</h2>
          <p className="text-sm text-[#444444]">Enviamos un enlace de verificación a</p>
          <p className="text-sm font-semibold text-navy mt-1 mb-4 break-all">{successEmail}</p>
          <p className="text-xs text-[#444444] mb-7">
            Haz clic en el enlace para activar tu cuenta.
            Puede tardar unos minutos — revisa también tu carpeta de spam.
          </p>
          <Link
            href="/login"
            className="block w-full py-3 bg-navy text-white text-sm font-semibold rounded-element hover:bg-navy/90 transition-colors text-center"
          >
            Ir al inicio de sesión
          </Link>
        </div>
      </main>
    )
  }

  // ── Register form ──────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-navy flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-card shadow-2xl w-full max-w-sm p-8">

        {/* Brand */}
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">⚽</div>
          <h1 className="text-xl font-semibold text-navy tracking-wide">QUINIELA</h1>
          <p className="text-skyblue text-xs font-medium mt-0.5">
            Mundial 2026 · Proyelec International
          </p>
        </div>

        <div className="border-t border-[#CCCCCC] mb-5" />

        <h2 className="text-sm font-semibold text-navy mb-4">Crear cuenta</h2>

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
            <p className="text-[10px] text-[#444444] mt-1">Solo correos @proyelec.com</p>
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
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#CCCCCC] text-sm select-none">@</span>
              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                placeholder="juan_perez"
                autoComplete="username"
                className={`${inputClass} pl-7`}
              />
            </div>
            <p className="text-[10px] text-[#444444] mt-1">
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
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-element px-3 py-2.5 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-1 bg-navy text-white text-sm font-semibold rounded-element hover:bg-navy/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-[#444444] mt-5">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-skyblue font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  )
}
