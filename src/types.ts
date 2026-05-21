/**
 * Definiciones de tipos TypeScript
 *
 * Proporciona las interfaces y tipos principales para toda la aplicación.
 */

/** Proveedor de autenticación soportado */
export type AuthProvider = 'email' | 'google'

/**
 * Información del usuario autenticado
 */
export interface User {
  id: string
  name: string
  email: string
  provider: AuthProvider
}

/** Estado posible de un sensor */
export type SensorStatus = 'online' | 'warning' | 'offline'

/** Rango temporal para historial de lecturas */
export type ReadingTimeRange = '24h' | '7d' | '30d'

/**
 * Representa un sensor de tinaco
 */
export interface Sensor {
  id: string
  name: string
  status: SensorStatus
  maxCapacityLiters: number
  tankHeightCm: number
  waterDistanceCm: number
  currentLiters: number
  measurementIntervalMinutes: number
  lastReadingPercent: number
  lastReadingAt: string
  alerts: SensorAlertSettings
}

/**
 * Una lectura individual de un sensor
 */
export interface Reading {
  id: string
  sensorId: string
  percentage: number
  liters: number
  measuredAt: string
}

/**
 * Notificación del sistema
 */
export interface Notification {
  id: string
  type: 'info' | 'warning' | 'critical'
  message: string
  createdAt: string
  read: boolean
}

/**
 * Input para registrar un nuevo sensor
 */
export interface RegisterSensorInput {
  id: string
}

/** Canal de notificación para alertas del sensor */
export type NotificationMethod = 'EMAIL' | 'SMS'

/**
 * Configuración de alertas para un sensor
 */
export interface SensorAlertSettings {
  disconnect: boolean
  lowWater: boolean
  lowWaterThresholdPercent: number
  notificationMethod: NotificationMethod
  cooldownMinutes: number
}

export interface SensorSettingsInput {
  name: string
  maxCapacityLiters: number
  tankHeightCm: number
  waterDistanceCm: number
  measurementIntervalMinutes: number
}

export interface SensorAlertsInput {
  disconnect: boolean
  lowWater: boolean
  lowWaterThresholdPercent: number
  notificationMethod: NotificationMethod
  cooldownMinutes: number
}
