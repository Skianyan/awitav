/**
 * Utilidades de formateo de datos
 *
 * Proporciona funciones para formatear números, fechas y estados
 * de sensores según la configuración regional (español de México).
 */

/**
 * Formatea un número como litros con separadores de miles
 * @param {number} value - Cantidad de litros
 * @returns {string} Valor formateado con unidad "L"
 * @example formatLiters(1100) // "1,100 L"
 */
export const formatLiters = (value: number) => `${new Intl.NumberFormat('es-MX').format(value)} L`

/**
 * Formatea una fecha ISO a formato legible con hora
 * @param {string} value - Fecha en formato ISO
 * @returns {string} Fecha formateada (ej: "13 may 2026 14:30")
 * @example formatDateTime("2026-05-13T14:30:00Z") // "13 may 2026 14:30"
 */
export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

/**
 * Convierte una fecha a tiempo relativo ("hace X minutos/horas/días")
 * @param {string} value - Fecha en formato ISO
 * @returns {string} Tiempo relativo en formato legible
 * @example formatRelativeTime("2026-05-13T14:00:00Z") // "hace 30 min"
 */
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

/**
 * Obtiene la etiqueta legible del estado del sensor
 * @param {string} status - Estado del sensor (online, warning, offline)
 * @returns {string} Etiqueta del estado en español
 * @example getSensorStatusLabel("online") // "En línea"
 */
export const getSensorStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    online: 'En línea',
    warning: 'Alerta',
    offline: 'Sin conexión',
  }

  return labels[status] ?? status
}
