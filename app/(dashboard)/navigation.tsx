'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, GitBranch, Award } from 'lucide-react'

const navItems = [
  { name: 'Inicio', href: '/dashboard', icon: Home },
  { name: 'Predicciones', href: '/predictions', icon: Trophy },
  { name: 'Bracket', href: '/bracket', icon: GitBranch },
  { name: 'Leaderboard', href: '/leaderboard', icon: Award },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-navy border-t border-[#64AFE6]/20 md:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.15)]">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-20 h-full space-y-1 transition-all duration-200 ${
                isActive 
                  ? 'text-skyblue scale-105 font-medium' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-5.5 h-5.5" />
              <span className="text-[10px] tracking-wide">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function DesktopNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex items-center space-x-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-2 px-4 py-2 rounded-pill text-sm font-medium transition-all duration-200 ${
              isActive 
                ? 'bg-skyblue/10 text-skyblue' 
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
