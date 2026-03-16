'use client'

import { useState } from 'react'

type Props = {
  name:         string
  label:        string
  type?:        string
  placeholder?: string
  required?:    boolean
  className?:   string
  showStrength?: boolean
}

export default function Input({
  name,
  label,
  type        = 'text',
  placeholder = '',
  required    = false,
  className   = '',
  showStrength = false,
}: Props) {
  const [visible, setVisible]   = useState(false)
  const [value, setValue]       = useState('')

  const isPassword = type === 'password'
  const inputType  = isPassword && visible ? 'text' : type

  // Requisitos de contraseña
  const requirements = [
    { label: 'Mínimo 8 caracteres', met: value.length >= 8 },
  ]

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={name} className="text-sm font-medium text-gray-300">
        {label}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          required={required}
          value={isPassword ? value : undefined}
          onChange={isPassword ? (e) => setValue(e.target.value) : undefined}
          className="
            w-full bg-gray-800 border border-gray-700 rounded-xl
            px-4 py-3 text-white placeholder-gray-500
            focus:outline-none focus:border-purple-500
            transition-colors text-base
            pr-12
          "
        />

        {/* Botón mostrar/ocultar — solo en campos password */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors text-lg"
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {visible ? '🙈' : '👁️'}
          </button>
        )}
      </div>

      {/* Requisitos — solo si showStrength=true y hay algo escrito */}
      {isPassword && showStrength && value.length > 0 && (
        <ul className="mt-1 space-y-1">
          {requirements.map((req) => (
            <li key={req.label} className="flex items-center gap-2 text-xs">
              <span className={req.met ? 'text-green-400' : 'text-gray-500'}>
                {req.met ? '✅' : '○'}
              </span>
              <span className={req.met ? 'text-green-400' : 'text-gray-500'}>
                {req.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}