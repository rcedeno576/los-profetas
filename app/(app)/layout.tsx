'use client'

import { useOnlineStatus } from '@/app/hooks/useOnlineStatus'
import OfflinePage from '@/app/~offline/page'
import BottomNav from '@/app/components/layout/BottomNav'
import { ReactNode } from 'react'

export default function AppLayout({ children }: { children: ReactNode }) {
  const isOnline = useOnlineStatus()
  if (!isOnline) return <OfflinePage />
  return (
    <>
      <div className="pb-16">
        {children}
      </div>
      <BottomNav />
    </>
  )
}