import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { sensorService } from '@/services/sensorService'
import type {
  Notification,
  Reading,
  RegisterSensorInput,
  Sensor,
  SensorAlertsInput,
  SensorSettingsInput,
} from '@/types'

export const useSensorsStore = defineStore('sensors', () => {
  const sensors = ref<Sensor[]>([])
  const readings = ref<Reading[]>([])
  const notifications = ref<Notification[]>([])
  const isLoading = ref(false)

  const pendingNotifications = computed(() => notifications.value.filter((item) => !item.read))

  const registeredSensorIdSet = computed(() => new Set(sensors.value.map((sensor) => sensor.id)))

  const recentReadings = computed(() =>
    readings.value
      .filter((reading) => registeredSensorIdSet.value.has(reading.sensorId))
      .slice()
      .sort((first, second) => new Date(second.measuredAt).getTime() - new Date(first.measuredAt).getTime())
      .slice(0, 6),
  )

  async function loadDashboardData() {
    isLoading.value = true

    try {
      const [sensorList, readingList, notificationList] = await Promise.all([
        sensorService.getSensors(),
        sensorService.getReadings(),
        sensorService.getNotifications(),
      ])

      sensors.value = sensorList
      readings.value = readingList
      notifications.value = notificationList
    } finally {
      isLoading.value = false
    }
  }

  async function addSensor(input: RegisterSensorInput) {
    const sensor = await sensorService.registerSensor(input)
    sensors.value = [sensor, ...sensors.value]
    readings.value = await sensorService.getReadings()
  }

  async function updateSensorSettings(sensorId: string, input: SensorSettingsInput) {
    const sensor = await sensorService.updateSensorSettings(sensorId, input)
    sensors.value = sensors.value.map((item) => (item.id === sensorId ? sensor : item))
  }

  async function updateSensorAlerts(sensorId: string, input: SensorAlertsInput) {
    const sensor = await sensorService.updateSensorAlerts(sensorId, input)
    sensors.value = sensors.value.map((item) => (item.id === sensorId ? sensor : item))
  }

  async function unlinkSensor(sensorId: string) {
    await sensorService.unregisterSensor(sensorId)
    sensors.value = await sensorService.getSensors()
  }

  async function markNotificationAsRead(notificationId: string) {
    await sensorService.markNotificationRead(notificationId)
    notifications.value = await sensorService.getNotifications()
  }

  async function markAllNotificationsAsRead() {
    await sensorService.markAllNotificationsRead()
    notifications.value = await sensorService.getNotifications()
  }

  async function clearReadNotifications() {
    await sensorService.clearReadNotifications()
    notifications.value = await sensorService.getNotifications()
  }

  function getSensorReadings(sensorId: string) {
    return readings.value
      .filter((reading) => reading.sensorId === sensorId)
      .sort((first, second) => new Date(second.measuredAt).getTime() - new Date(first.measuredAt).getTime())
  }

  return {
    sensors,
    readings,
    notifications,
    isLoading,
    pendingNotifications,
    recentReadings,
    loadDashboardData,
    addSensor,
    updateSensorSettings,
    updateSensorAlerts,
    unlinkSensor,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearReadNotifications,
    getSensorReadings,
  }
})
