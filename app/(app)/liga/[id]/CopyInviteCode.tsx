'use client'

import { useState } from 'react'
import Card from '@/app/components/ui/Card'

export default function CopyInviteCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="text-center">
      <p className="text-gray-400 text-sm mb-3">Código de invitación</p>
      <p className="text-4xl font-bold text-purple-400 tracking-widest mb-4">
        {code}
      </p>
      <button
        onClick={handleCopy}
        className="w-full py-2 rounded-xl border border-gray-700
                   text-sm font-medium transition-all
                   hover:border-purple-500 hover:text-purple-400
                   text-gray-400"
      >
        {copied ? '✅ Copiado!' : '📋 Copiar código'}
      </button>
      <p className="text-gray-600 text-xs mt-2">
        Comparte este código para que otros se unan
      </p>
    </Card>
  )
}