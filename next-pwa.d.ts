declare module 'next-pwa' {
  import type { NextConfig } from 'next'

  type PWAOptions = {
    dest?: string
    disable?: boolean
    register?: boolean
    skipWaiting?: boolean
    customWorkerDir?: string
    customWorkerDest?: string
    customWorkerPrefix?: string
    fallbacks?: {
      document?: string
      image?: string
      audio?: string
      video?: string
      font?: string
    }
  }

  function withPWA(options?: PWAOptions): (config: NextConfig) => NextConfig

  export default withPWA
}