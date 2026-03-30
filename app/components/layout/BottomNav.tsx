'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Liguillas', IconActive: Home, IconInactive: Home },
  { href: '/perfil', label: 'Perfil', IconActive: User, IconInactive: User },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#051126]/95 backdrop-blur-md">
      <div className="max-w-lg mx-auto flex">
        {NAV_ITEMS.map(({ href, label, IconActive, IconInactive }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          const Icon = isActive ? IconActive : IconInactive
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
            >
              <Icon
                size={22}
                className={isActive ? 'text-violet-400' : 'text-white/30'}
                fill={isActive ? 'currentColor' : 'none'}
              />
              <span className={`text-xs font-medium ${isActive ? 'text-violet-400' : 'text-white/30'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}