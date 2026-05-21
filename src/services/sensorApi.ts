import { apiFetch } from '@/services/apiClient'
import {
  mapApiNotification,
  mapApiReading,
  mapApiSensor,
  type ApiReading,
  type ApiSensor,
} from '@/services/apiMappers'
import type {
  Notification,
  Reading,
  ReadingTimeRange,
  RegisterSensorInput,
  Sensor,
  SensorAlertsInput,
  SensorSettingsInput,
} from '@/types'

type ApiNotification = Parameters<typeof mapApiNotification>[0]

async function fetchSensor(sensorId: string): Promise<Sensor> {
  const response = await apiFetch<ApiSensor>(`/sensors/${sensorId}`)
  return mapApiSensor(response)
}

export const sensorApi = {
  async getSensor(sensorId: string): Promise<Sensor> {
    return fetchSensor(sensorId)
  },

  async getSensorReadings(
    sensorId: string,
    timeRange: ReadingTimeRange = '24h',
  ): Promise<Reading[]> {
    const params = new URLSearchParams({ timeRange })
    const response = await apiFetch<ApiReading[]>(`/sensors/${sensorId}/readings?${params}`)
    return response.map(mapApiReading)
  },

  async getSensors(): Promise<Sensor[]> {
    const response = await apiFetch<ApiSensor[]>('/sensors')
    return response.map(mapApiSensor)
  },

  async getReadings(): Promise<Reading[]> {
    const sensors = await this.getSensors()
    if (!sensors.length) {
      return []
    }

    const readingsBySensor = await Promise.all(
      sensors.map(async (sensor) => {
        const response = await apiFetch<ApiReading[]>(
          `/sensors/${sensor.id}/readings?limit=100`,
        )
        return response.map(mapApiReading)
      }),
    )

    return readingsBySensor.flat()
  },

  async getNotifications(): Promise<Notification[]> {
    const response = await apiFetch<ApiNotification[]>('/notifications')
    return response.map(mapApiNotification)
  },

  async markNotificationRead(notificationId: string): Promise<void> {
    await apiFetch(`/notifications/${notificationId}/read`, { method: 'POST' })
  },

  async markAllNotificationsRead(): Promise<void> {
    await apiFetch('/notifications/mark-all-read', { method: 'POST' })
  },

  async clearReadNotifications(): Promise<void> {
    // El backend no expone eliminación de notificaciones leídas.
    // La UI filtra localmente tras recargar; no hay operación remota.
  },

  async registerSensor(input: RegisterSensorInput): Promise<Sensor> {
    const response = await apiFetch<ApiSensor>('/sensors', {
      method: 'POST',
      body: JSON.stringify({ sensor_id: input.id.trim().toUpperCase() }),
    })
    return mapApiSensor(response)
  },

  async unregisterSensor(sensorId: string): Promise<void> {
    await apiFetch(`/sensors/${sensorId}`, { method: 'DELETE' })
  },

  async updateSensorSettings(sensorId: string, input: SensorSettingsInput): Promise<Sensor> {
    await apiFetch<ApiSensor>(`/sensors/${sensorId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: input.name,
        capacity: input.maxCapacityLiters,
        height: input.tankHeightCm,
        water_distance: input.waterDistanceCm,
        time_between_readings: input.measurementIntervalMinutes * 60,
      }),
    })

    return fetchSensor(sensorId)
  },

  async updateSensorAlerts(sensorId: string, input: SensorAlertsInput): Promise<Sensor> {
    const current = await fetchSensor(sensorId)

    if (current.alerts.lowWater !== input.lowWater) {
      await apiFetch(`/sensors/${sensorId}/water-level-alert`, { method: 'PATCH' })
    }

    if (current.alerts.disconnect !== input.disconnect) {
      await apiFetch(`/sensors/${sensorId}/disconnection-alert`, { method: 'PATCH' })
    }

    if (current.alerts.lowWaterThresholdPercent !== input.lowWaterThresholdPercent) {
      await apiFetch(`/sensors/${sensorId}/water-level-threshold`, {
        method: 'PATCH',
        body: JSON.stringify({ threshold: input.lowWaterThresholdPercent }),
      })
    }

    const preferencesChanged =
      current.alerts.notificationMethod !== input.notificationMethod ||
      current.alerts.cooldownMinutes !== input.cooldownMinutes

    if (preferencesChanged) {
      await apiFetch(`/sensors/${sensorId}/alert-preferences`, {
        method: 'PATCH',
        body: JSON.stringify({
          notification_method: input.notificationMethod,
          cooldown_minutes: input.cooldownMinutes,
        }),
      })
    }

    return fetchSensor(sensorId)
  },
}
