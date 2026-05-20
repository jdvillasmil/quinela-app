import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { Profile } from '@/types'
import { User, Mail, AtSign, Shield, Calendar } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mi Perfil — Quiniela Proyelec',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null; error: unknown }

  const initials = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase()
    || user.email?.[0]?.toUpperCase()
    || 'U'
  const fullName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : 'Usuario Proyelec'
  const isAdmin = profile?.role === 'admin'

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Mi Perfil</h1>
        <p className="text-sm text-gray-500 mt-1">Información de tu cuenta en la quiniela.</p>
      </div>

      {/* Avatar + nombre */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-skyblue">{initials}</span>
        </div>
        <div>
          <p className="text-lg font-semibold text-navy">{fullName}</p>
          <p className="text-sm text-gray-500">@{profile?.username}</p>
          {isAdmin && (
            <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
              <Shield className="w-3 h-3" />
              Administrador
            </span>
          )}
        </div>
      </div>

      {/* Campos de info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        <ProfileField icon={AtSign} label="Usuario" value={`@${profile?.username}`} />
        <ProfileField icon={Mail} label="Correo electrónico" value={profile?.email || user.email || ''} />
        <ProfileField icon={User} label="Nombre" value={profile?.first_name || '—'} />
        <ProfileField icon={User} label="Apellido" value={profile?.last_name || '—'} />
        <ProfileField
          icon={Shield}
          label="Rol"
          value={isAdmin ? 'Administrador' : 'Participante'}
        />
        {profile?.created_at && (
          <ProfileField
            icon={Calendar}
            label="Miembro desde"
            value={new Date(profile.created_at).toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          />
        )}
      </div>
    </div>
  )
}

function ProfileField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <Icon className="w-4 h-4 text-skyblue flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-navy mt-0.5 truncate">{value}</p>
      </div>
    </div>
  )
}
