export const formatLiters = (value: number) => `${new Intl.NumberFormat('es-MX').format(value)} L`

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

export const formatRelativeTime = (value: string) => {
  const diffMs = Date.now() - new Date(value).getTime()
  const diffMinutes = Math.max(1, Math.round(diffMs / 60_000))

  if (diffMinutes < 60) {
    return `hace ${diffMinutes} min`
  }

  const diffHours = Math.round(diffMinutes / 60)

  if (diffHours < 24) {
    return `hace ${diffHours} h`
  }

  const diffDays = Math.round(diffHours / 24)
  return `hace ${diffDays} d`
}

export const getSensorStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    online: 'En línea',
    warning: 'Alerta',
    offline: 'Sin conexión',
  }

  return labels[status] ?? status
}
