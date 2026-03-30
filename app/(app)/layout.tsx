'use client'

import { useOnlineStatus } from '@/app/hooks/useOnlineStatus'
import OfflinePage from '@/app/~offline/page'
import { ReactNode } from 'react'

export default function AppLayout({ children }: { children: ReactNode }) {
  const isOnline = useOnlineStatus()
  if (!isOnline) return <OfflinePage />
  return <>{children}</>
}