import { createClient } from '@/lib/supabase/server'
import { Users, Swords, Target, Database } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  const [{ count: usersCount }, { count: matchesCount }, { count: pendingMatchesCount }, { count: predictionsCount }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('matches').select('*', { count: 'exact', head: true }),
    supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
    supabase.from('predictions').select('*', { count: 'exact', head: true })
  ])

  const stats = [
    { label: 'Usuarios Registrados', value: usersCount ?? 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Partidos Totales', value: matchesCount ?? 0, icon: Database, color: 'bg-purple-500' },
    { label: 'Partidos Pendientes', value: pendingMatchesCount ?? 0, icon: Swords, color: 'bg-amber-500' },
    { label: 'Predicciones (Fase de Grupos)', value: predictionsCount ?? 0, icon: Target, color: 'bg-emerald-500' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Métricas Generales</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-navy">{stat.value}</h3>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
