import type {
  NewSensorInput,
  Notification,
  Reading,
  Sensor,
  SensorAlertsInput,
  SensorSettingsInput,
} from '@/types'

const now = new Date()
const minutesAgo = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString()

let sensors: Sensor[] = [
  {
    id: 'AWT-001',
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
    },
  },
  {
    id: 'AWT-002',
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
    },
  },
  {
    id: 'AWT-003',
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
    },
  },
]

let readings: Reading[] = [
  { id: 'R-001', sensorId: 'AWT-001', percentage: 75, liters: 825, measuredAt: minutesAgo(7) },
  { id: 'R-002', sensorId: 'AWT-001', percentage: 72, liters: 792, measuredAt: minutesAgo(22) },
  { id: 'R-003', sensorId: 'AWT-001', percentage: 69, liters: 759, measuredAt: minutesAgo(37) },
  { id: 'R-004', sensorId: 'AWT-002', percentage: 28, liters: 210, measuredAt: minutesAgo(18) },
  { id: 'R-005', sensorId: 'AWT-002', percentage: 32, liters: 240, measuredAt: minutesAgo(28) },
  { id: 'R-006', sensorId: 'AWT-003', percentage: 0, liters: 0, measuredAt: minutesAgo(184) },
]

const notifications: Notification[] = [
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

export const sensorService = {
  async getSensors(): Promise<Sensor[]> {
    return [...sensors]
  },

  async getReadings(): Promise<Reading[]> {
    return [...readings]
  },

  async getNotifications(): Promise<Notification[]> {
    return [...notifications]
  },

  async createSensor(input: NewSensorInput): Promise<Sensor> {
    const id = `AWT-${String(sensors.length + 1).padStart(3, '0')}`
    const sensor: Sensor = {
      id,
      name: input.name,
      status: 'online',
      maxCapacityLiters: input.maxCapacityLiters,
      tankHeightCm: 120,
      waterDistanceCm: 120,
      currentLiters: 0,
      measurementIntervalMinutes: input.measurementIntervalMinutes,
      lastReadingPercent: 0,
      lastReadingAt: new Date().toISOString(),
      alerts: {
        disconnect: true,
        lowWater: true,
        lowWaterThresholdPercent: 25,
      },
    }

    sensors = [sensor, ...sensors]
    readings = [
      {
        id: `R-${String(readings.length + 1).padStart(3, '0')}`,
        sensorId: id,
        percentage: 0,
        liters: 0,
        measuredAt: sensor.lastReadingAt,
      },
      ...readings,
    ]

    return sensor
  },

  async updateSensorSettings(sensorId: string, input: SensorSettingsInput): Promise<Sensor> {
    const sensor = sensors.find((item) => item.id === sensorId)

    if (!sensor) {
      throw new Error('Sensor no encontrado')
    }

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

    sensors = sensors.map((item) => (item.id === sensorId ? updatedSensor : item))
    return updatedSensor
  },

  async updateSensorAlerts(sensorId: string, input: SensorAlertsInput): Promise<Sensor> {
    const sensor = sensors.find((item) => item.id === sensorId)

    if (!sensor) {
      throw new Error('Sensor no encontrado')
    }

    const updatedSensor: Sensor = {
      ...sensor,
      alerts: input,
    }

    sensors = sensors.map((item) => (item.id === sensorId ? updatedSensor : item))
    return updatedSensor
  },
}
