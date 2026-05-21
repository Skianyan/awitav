import type {
  Notification,
  NotificationMethod,
  Reading,
  Sensor,
  SensorStatus,
} from '@/types'

type ApiWaterLevel = {
  currentLevel: number
  percentage: number
}

type ApiSensorReading = {
  reading?: number | string
  rssi?: number
  created_at?: string | null
  water_level?: ApiWaterLevel | null
}

export type ApiSensor = {
  id: string
  name: string
  capacity: number
  height: number
  water_distance: number
  time_between_readings: number
  custom_name?: string | null
  water_level?: ApiWaterLevel | null
  status?: boolean
  sensor_readings?: ApiSensorReading[]
  water_level_alert?: boolean
  disconnection_alert?: boolean
  water_level_threshold?: number | string | null
  notification_method?: string
  cooldown_minutes?: number
}

export type ApiReading = {
  id: string
  sensor_id: string
  reading?: number | string
  created_at?: string | null
  water_level?: ApiWaterLevel | null
}

type ApiNotification = {
  id: string
  type: string
  current_value?: number | string
  threshold_value?: number | string
  created_at: string
  read: boolean
  sensors?: {
    name?: string
    location?: string | null
  }
}

function toIsoDate(value?: string | null): string {
  if (!value) {
    return new Date(0).toISOString()
  }

  return new Date(value).toISOString()
}

function resolveSensorStatus(apiSensor: ApiSensor): SensorStatus {
  const percentage = apiSensor.water_level?.percentage ?? 0
  const isOnline = apiSensor.status === true

  if (!isOnline) {
    return 'offline'
  }

  if (percentage < 30) {
    return 'warning'
  }

  return 'online'
}

export function mapApiSensor(apiSensor: ApiSensor): Sensor {
  const lastReading = apiSensor.sensor_readings?.[0]
  const waterLevel =
    apiSensor.water_level ?? lastReading?.water_level ?? null

  return {
    id: apiSensor.id,
    name: apiSensor.custom_name?.trim() || apiSensor.name,
    status: resolveSensorStatus(apiSensor),
    maxCapacityLiters: apiSensor.capacity,
    tankHeightCm: apiSensor.height,
    waterDistanceCm: apiSensor.water_distance,
    currentLiters: waterLevel?.currentLevel ?? 0,
    measurementIntervalMinutes: Math.max(1, Math.round(apiSensor.time_between_readings / 60)),
    lastReadingPercent: waterLevel?.percentage ?? 0,
    lastReadingAt: toIsoDate(lastReading?.created_at),
    alerts: {
      disconnect: apiSensor.disconnection_alert ?? true,
      lowWater: apiSensor.water_level_alert ?? true,
      lowWaterThresholdPercent: Number(apiSensor.water_level_threshold ?? 20),
      notificationMethod:
        apiSensor.notification_method === 'SMS' ? 'SMS' : ('EMAIL' as NotificationMethod),
      cooldownMinutes: Number(apiSensor.cooldown_minutes ?? 360),
    },
  }
}

export function mapApiReading(apiReading: ApiReading): Reading {
  const waterLevel = apiReading.water_level

  return {
    id: apiReading.id,
    sensorId: apiReading.sensor_id,
    percentage: waterLevel?.percentage ?? 0,
    liters: waterLevel?.currentLevel ?? 0,
    measuredAt: toIsoDate(apiReading.created_at),
  }
}

function mapNotificationType(type: string): Notification['type'] {
  if (type === 'DISCONNECTION') {
    return 'critical'
  }

  if (type === 'WATER_LEVEL') {
    return 'warning'
  }

  return 'info'
}

function buildNotificationMessage(notification: ApiNotification): string {
  const sensorName = notification.sensors?.name ?? 'Tinaco'

  if (notification.type === 'DISCONNECTION') {
    return `${sensorName} no ha reportado lecturas recientes.`
  }

  if (notification.type === 'WATER_LEVEL') {
    const level = Number(notification.current_value)
    return `${sensorName} está por debajo del umbral (${Number.isFinite(level) ? `${level}%` : 'nivel bajo'}).`
  }

  return `${sensorName}: nueva alerta del sistema.`
}

export function mapApiNotification(notification: ApiNotification): Notification {
  return {
    id: notification.id,
    type: mapNotificationType(notification.type),
    message: buildNotificationMessage(notification),
    createdAt: toIsoDate(notification.created_at),
    read: notification.read,
  }
}
