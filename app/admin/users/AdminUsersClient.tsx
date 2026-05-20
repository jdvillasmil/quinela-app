'use client'

import { Download } from 'lucide-react'
import type { Profile, LeaderboardEntry } from '@/types'

export default function AdminUsersClient({ 
  users, 
  leaderboard 
}: { 
  users: Profile[]
  leaderboard: LeaderboardEntry[] 
}) {

  const exportToCSV = () => {
    // Generate CSV string
    const headers = ['Rank,Usuario,Puntos_Totales,Puntos_Grupos,Puntos_Eliminatoria,Puntos_Especiales']
    const rows = leaderboard.map(l => 
      `${l.rank},${l.username},${l.total_points},${l.group_points},${l.knockout_points},${l.special_points}`
    )
    const csvContent = [...headers, ...rows].join('\n')

    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'leaderboard_proyelec.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Gestión de Usuarios</h1>
          <p className="text-sm text-gray-500 mt-1">Lista de todos los usuarios registrados en el torneo.</p>
        </div>
        
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Exportar Ranking a CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Nombre Completo</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-center">Rol</th>
                <th className="px-6 py-4">Fecha de Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-navy">@{u.username}</td>
                  <td className="px-6 py-4 text-gray-700">{u.first_name} {u.last_name}</td>
                  <td className="px-6 py-4 text-gray-500">{u.email}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-600 border border-blue-200'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(u.created_at).toLocaleDateString('es-CO', {
                       year: 'numeric',
                       month: 'short',
                       day: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
