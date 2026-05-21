/**
 * Implementación mock del servicio de sensores (desarrollo sin backend).
 */
import type {
  Notification,
  Reading,
  ReadingTimeRange,
  RegisterSensorInput,
  Sensor,
  SensorAlertsInput,
  SensorSettingsInput,
} from '@/types'

const rangeMilliseconds: Record<ReadingTimeRange, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
}
import { assertValidSensorId, assertValidSensorSettings } from '@/utils/sensorValidation'

const now = new Date()
const minutesAgo = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString()

let adminSensors: Sensor[] = [
  {
    id: 'TINC01',
    name: 'Tinaco principal',
    status: 'online',
    maxCapacityLiters: 1100,
    tankHeightCm: 140,
    waterDistanceCm: 35,
    currentLiters: 825,
    measurementIntervalMinutes: 15,
    lastReadingPercent: 75,
    lastReadingAt: minutesAgo(7),
    alerts: {
      disconnect: true,
      lowWater: true,
      lowWaterThresholdPercent: 25,
      notificationMethod: 'EMAIL',
      cooldownMinutes: 360,
    },
  },
  {
    id: 'TINC02',
    name: 'Tinaco azotea',
    status: 'warning',
    maxCapacityLiters: 750,
    tankHeightCm: 120,
    waterDistanceCm: 86,
    currentLiters: 210,
    measurementIntervalMinutes: 10,
    lastReadingPercent: 28,
    lastReadingAt: minutesAgo(18),
    alerts: {
      disconnect: true,
      lowWater: true,
      lowWaterThresholdPercent: 30,
      notificationMethod: 'EMAIL',
      cooldownMinutes: 180,
    },
  },
  {
    id: 'TINC03',
    name: 'Reserva patio',
    status: 'offline',
    maxCapacityLiters: 450,
    tankHeightCm: 95,
    waterDistanceCm: 95,
    currentLiters: 0,
    measurementIntervalMinutes: 30,
    lastReadingPercent: 0,
    lastReadingAt: minutesAgo(184),
    alerts: {
      disconnect: true,
      lowWater: false,
      lowWaterThresholdPercent: 20,
      notificationMethod: 'EMAIL',
      cooldownMinutes: 360,
    },
  },
  {
    id: 'TINC04',
    name: 'Tinaco lavandería',
    status: 'online',
    maxCapacityLiters: 600,
    tankHeightCm: 110,
    waterDistanceCm: 44,
    currentLiters: 360,
    measurementIntervalMinutes: 20,
    lastReadingPercent: 60,
    lastReadingAt: minutesAgo(12),
    alerts: {
      disconnect: true,
      lowWater: true,
      lowWaterThresholdPercent: 25,
      notificationMethod: 'SMS',
      cooldownMinutes: 120,
    },
  },
]

let registeredSensorIds = ['TINC01', 'TINC02', 'TINC03']

let readings: Reading[] = [
  { id: 'R-001', sensorId: 'TINC01', percentage: 75, liters: 825, measuredAt: minutesAgo(7) },
  { id: 'R-002', sensorId: 'TINC01', percentage: 72, liters: 792, measuredAt: minutesAgo(22) },
  { id: 'R-003', sensorId: 'TINC01', percentage: 69, liters: 759, measuredAt: minutesAgo(37) },
  { id: 'R-004', sensorId: 'TINC02', percentage: 28, liters: 210, measuredAt: minutesAgo(18) },
  { id: 'R-005', sensorId: 'TINC02', percentage: 32, liters: 240, measuredAt: minutesAgo(28) },
  { id: 'R-006', sensorId: 'TINC03', percentage: 0, liters: 0, measuredAt: minutesAgo(184) },
  { id: 'R-007', sensorId: 'TINC04', percentage: 60, liters: 360, measuredAt: minutesAgo(12) },
]

let notifications: Notification[] = [
  {
    id: 'N-001',
    type: 'warning',
    message: 'El tinaco azotea está por debajo del 30% de capacidad.',
    createdAt: minutesAgo(18),
    read: false,
  },
  {
    id: 'N-002',
    type: 'critical',
    message: 'Reserva patio no ha reportado lecturas recientes.',
    createdAt: minutesAgo(184),
    read: false,
  },
]

export const sensorServiceMock = {
  async getSensor(sensorId: string): Promise<Sensor> {
    const sensor = adminSensors.find(
      (item) => item.id === sensorId && registeredSensorIds.includes(sensorId),
    )

    if (!sensor) {
      throw new Error('Sensor no encontrado')
    }

    return sensor
  },

  async getSensorReadings(
    sensorId: string,
    timeRange: ReadingTimeRange = '24h',
  ): Promise<Reading[]> {
    const sensorReadings = readings
      .filter((reading) => reading.sensorId === sensorId)
      .sort((first, second) => new Date(first.measuredAt).getTime() - new Date(second.measuredAt).getTime())

    if (sensorReadings.length === 0) {
      return []
    }

    const latestTimestamp = new Date(sensorReadings[sensorReadings.length - 1].measuredAt).getTime()
    const startTimestamp = latestTimestamp - rangeMilliseconds[timeRange]

    return sensorReadings.filter(
      (reading) => new Date(reading.measuredAt).getTime() >= startTimestamp,
    )
  },

  async getSensors(): Promise<Sensor[]> {
    return adminSensors.filter((sensor) => registeredSensorIds.includes(sensor.id))
  },

  async getReadings(): Promise<Reading[]> {
    return [...readings]
  },

  async getNotifications(): Promise<Notification[]> {
    return [...notifications]
  },

  async markNotificationRead(notificationId: string): Promise<void> {
    notifications = notifications.map((item) =>
      item.id === notificationId ? { ...item, read: true } : item,
    )
  },

  async markAllNotificationsRead(): Promise<void> {
    notifications = notifications.map((item) => ({ ...item, read: true }))
  },

  async clearReadNotifications(): Promise<void> {
    notifications = notifications.filter((item) => !item.read)
  },

  async registerSensor(input: RegisterSensorInput): Promise<Sensor> {
    const id = input.id.trim().toUpperCase()

    assertValidSensorId(id)

    const sensor = adminSensors.find((item) => item.id === id)

    if (!sensor) {
      throw new Error('El sensor no existe en el catálogo del administrador.')
    }

    if (registeredSensorIds.includes(id)) {
      throw new Error('Este sensor ya está registrado en tus tinacos.')
    }

    registeredSensorIds = [id, ...registeredSensorIds]

    return sensor
  },

  async unregisterSensor(sensorId: string): Promise<void> {
    const id = sensorId.trim().toUpperCase()

    if (!registeredSensorIds.includes(id)) {
      throw new Error('Este tinaco no está vinculado a tu cuenta.')
    }

    registeredSensorIds = registeredSensorIds.filter((item) => item !== id)
  },

  async updateSensorSettings(sensorId: string, input: SensorSettingsInput): Promise<Sensor> {
    const sensor = adminSensors.find((item) => item.id === sensorId)

    if (!sensor) {
      throw new Error('Sensor no encontrado')
    }

    assertValidSensorSettings(input)

    const nextReadingPercent = Math.max(
      0,
      Math.min(100, Math.round(((input.tankHeightCm - input.waterDistanceCm) / input.tankHeightCm) * 100)),
    )

    const updatedSensor: Sensor = {
      ...sensor,
      name: input.name,
      maxCapacityLiters: input.maxCapacityLiters,
      tankHeightCm: input.tankHeightCm,
      waterDistanceCm: input.waterDistanceCm,
      measurementIntervalMinutes: input.measurementIntervalMinutes,
      lastReadingPercent: nextReadingPercent,
      currentLiters: Math.round((input.maxCapacityLiters * nextReadingPercent) / 100),
    }

    adminSensors = adminSensors.map((item) => (item.id === sensorId ? updatedSensor : item))
    return updatedSensor
  },

  async updateSensorAlerts(sensorId: string, input: SensorAlertsInput): Promise<Sensor> {
    const sensor = adminSensors.find((item) => item.id === sensorId)

    if (!sensor) {
      throw new Error('Sensor no encontrado')
    }

    const updatedSensor: Sensor = {
      ...sensor,
      alerts: input,
    }

    adminSensors = adminSensors.map((item) => (item.id === sensorId ? updatedSensor : item))
    return updatedSensor
  },
}
