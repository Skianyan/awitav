export type AuthProvider = 'email' | 'google'

export interface User {
  id: string
  email: string
  provider: AuthProvider
}

export type SensorStatus = 'online' | 'warning' | 'offline'

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

export interface Reading {
  id: string
  sensorId: string
  percentage: number
  liters: number
  measuredAt: string
}

export interface Notification {
  id: string
  type: 'info' | 'warning' | 'critical'
  message: string
  createdAt: string
  read: boolean
}

export interface RegisterSensorInput {
  id: string
}

export interface SensorAlertSettings {
  disconnect: boolean
  lowWater: boolean
  lowWaterThresholdPercent: number
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
}
