// Convierte fecha UTC a hora local del navegador
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es', {
    day:    'numeric',
    month:  'short',
    year:   'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat('es', {
    day:    'numeric',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatTimeOnly(date: string): string {
  return new Intl.DateTimeFormat('es', {
    hour:   '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days  = Math.floor(hours / 24)

  if (days > 0)  return `hace ${days} día${days > 1 ? 's' : ''}`
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`
  if (mins > 0)  return `hace ${mins} minuto${mins > 1 ? 's' : ''}`
  return 'ahora mismo'
}