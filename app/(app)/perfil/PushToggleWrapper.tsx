'use client'

import dynamic from 'next/dynamic'

const PushToggle = dynamic(() => import('./PushToggle'), { ssr: false })

export default function PushToggleWrapper() {
  return <PushToggle />
}