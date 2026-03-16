type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size    = 'sm' | 'md' | 'lg'

type Props = {
  children:   React.ReactNode
  onClick?:   () => void
  type?:      'button' | 'submit' | 'reset'
  variant?:   Variant
  size?:      Size
  disabled?:  boolean
  fullWidth?: boolean
  className?: string
}

const variants: Record<Variant, string> = {
  primary:   'bg-purple-600 hover:bg-purple-500 text-white disabled:bg-purple-900',
  secondary: 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700',
  danger:    'bg-red-600 hover:bg-red-500 text-white',
  ghost:     'bg-transparent hover:bg-gray-800 text-gray-300',
}

const sizes: Record<Size, string> = {
  sm:  'px-3 py-1.5 text-sm',
  md:  'px-4 py-3 text-base',
  lg:  'px-6 py-4 text-lg',
}

export default function Button({
  children,
  onClick,
  type      = 'button',
  variant   = 'primary',
  size      = 'md',
  disabled  = false,
  fullWidth = false,
  className = '',
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        font-bold rounded-xl transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  )
}