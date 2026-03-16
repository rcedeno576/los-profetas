'use client'

import { AVATARS } from '@/app/lib/constants'

type Props = {
  selected:  string
  onChange:  (id: string) => void
}

export default function AvatarPicker({ selected, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-3">
        Elige tu avatar
      </label>
      <div className="grid grid-cols-4 gap-2">
        {AVATARS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onChange(a.id)}
            className={`
              flex flex-col items-center p-3 rounded-xl border-2 transition-all
              ${selected === a.id
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-gray-700 bg-gray-800 hover:border-gray-600'}
            `}
          >
            <span className="text-2xl">{a.emoji}</span>
            <span className="text-xs text-gray-400 mt-1">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}