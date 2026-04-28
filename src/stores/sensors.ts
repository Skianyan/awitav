import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { sensorService } from '@/services/sensorService'
import type {
  NewSensorInput,
  Notification,
  Reading,
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

  const recentReadings = computed(() =>
    readings.value
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

  async function addSensor(input: NewSensorInput) {
    const sensor = await sensorService.createSensor(input)
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
    getSensorReadings,
  }
})
