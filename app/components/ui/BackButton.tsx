'use client'

import { useRouter } from 'next/navigation'

type Props = {
  fallback?: string  // ruta de fallback si no hay historial
  label?:    string
}

export default function BackButton({ fallback = '/dashboard', label = '←' }: Props) {
  const router = useRouter()

  function handleBack() {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(fallback)
    }
  }

  return (
    <button
      onClick={handleBack}
      className="text-gray-400 hover:text-white transition-colors"
    >
      {label}
    </button>
  )
}