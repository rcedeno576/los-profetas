'use client'

import { useEffect } from 'react'

export default function PWARegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('Service Worker registrado:', reg)
      })
      .catch((err) => {
        console.error('Error registrando Service Worker:', err)
      })
  }, [])

  return null
}