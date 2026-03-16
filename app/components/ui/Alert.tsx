type Variant = 'error' | 'success' | 'warning' | 'info'

type Props = {
  variant:    Variant
  message:    string
  className?: string
}

const styles: Record<Variant, { bg: string; text: string; icon: string }> = {
  error:   { bg: 'bg-red-500/10 border-red-500/30',     text: 'text-red-400',    icon: '❌' },
  success: { bg: 'bg-green-500/10 border-green-500/30', text: 'text-green-400',  icon: '✅' },
  warning: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400',  icon: '⚠️' },
  info:    { bg: 'bg-blue-500/10 border-blue-500/30',   text: 'text-blue-400',   icon: 'ℹ️' },
}

export default function Alert({ variant, message, className = '' }: Props) {
  const s = styles[variant]
  return (
    <div className={`
      ${s.bg} border rounded-xl px-4 py-3
      flex items-start gap-2 ${className}
    `}>
      <span className="text-sm mt-0.5">{s.icon}</span>
      <p className={`${s.text} text-sm`}>{message}</p>
    </div>
  )
}