<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import AuthenticatedLayout from '@/components/AuthenticatedLayout.vue'
import {
  MAX_CAPACITY_LITERS,
  MAX_MEASUREMENT_INTERVAL_MINUTES,
  MAX_TANK_HEIGHT_CM,
  MAX_WATER_DISTANCE_CM,
  SENSOR_ID_LENGTH,
} from '@/constants/sensorLimits'
import { useSensorsStore } from '@/stores/sensors'
import type { Sensor } from '@/types'
import { formatLiters, formatRelativeTime, getSensorStatusLabel } from '@/utils/format'

const sensorsStore = useSensorsStore()
const route = useRoute()
const router = useRouter()
const sensorIdPattern = `[A-Za-z0-9]{${SENSOR_ID_LENGTH}}`
const sensorIdRegex = new RegExp(`^[A-Za-z0-9]{${SENSOR_ID_LENGTH}}$`)
const isRegisterModalOpen = ref(false)
const editingSensorId = ref<string | null>(null)
const alertSensorId = ref<string | null>(null)
const unlinkConfirmSensor = ref<Sensor | null>(null)
const registerError = ref('')
const settingsError = ref('')
const alertsError = ref('')
const form = reactive({
  id: '',
})
const isSensorIdValid = computed(() => sensorIdRegex.test(form.id.trim().toUpperCase()))
const settingsForm = reactive({
  name: '',
  maxCapacityLiters: 1100,
  tankHeightCm: 120,
  waterDistanceCm: 60,
  measurementIntervalMinutes: 15,
})
const alertsForm = reactive({
  disconnect: true,
  lowWater: true,
  lowWaterThresholdPercent: 25,
  notificationMethod: 'EMAIL' as 'EMAIL' | 'SMS',
  cooldownMinutes: 360,
})

const isLowWaterThresholdDisabled = computed(() => !alertsForm.lowWater)

const canSaveAlerts = computed(() => {
  const cooldown = Number(alertsForm.cooldownMinutes)
  const cooldownValid = Number.isFinite(cooldown) && cooldown >= 1 && cooldown <= 1440

  if (!cooldownValid) {
    return false
  }

  if (!alertsForm.lowWater) {
    return true
  }

  const threshold = Number(alertsForm.lowWaterThresholdPercent)
  return Number.isFinite(threshold) && threshold >= 1 && threshold <= 100
})

const submitSensor = async () => {
  registerError.value = ''

  const id = form.id.trim().toUpperCase()
  if (!sensorIdRegex.test(id)) {
    registerError.value = `El ID debe tener exactamente ${SENSOR_ID_LENGTH} caracteres alfanuméricos.`
    return
  }

  try {
    await sensorsStore.addSensor({
      id,
    })

    form.id = ''
    isRegisterModalOpen.value = false
  } catch (error) {
    registerError.value = error instanceof Error ? error.message : 'No se pudo registrar el sensor.'
  }
}

const editSettings = (sensor: Sensor) => {
  editingSensorId.value = sensor.id
  alertSensorId.value = null
  settingsForm.name = sensor.name
  settingsForm.maxCapacityLiters = sensor.maxCapacityLiters
  settingsForm.tankHeightCm = sensor.tankHeightCm
  settingsForm.waterDistanceCm = sensor.waterDistanceCm
  settingsForm.measurementIntervalMinutes = sensor.measurementIntervalMinutes
}

const editAlerts = (sensor: Sensor) => {
  alertSensorId.value = sensor.id
  editingSensorId.value = null
  alertsForm.disconnect = sensor.alerts.disconnect
  alertsForm.lowWater = sensor.alerts.lowWater
  alertsForm.lowWaterThresholdPercent = sensor.alerts.lowWaterThresholdPercent
  alertsForm.notificationMethod = sensor.alerts.notificationMethod
  alertsForm.cooldownMinutes = sensor.alerts.cooldownMinutes
}

const openAlertsFromQuery = () => {
  const alertaId = route.query.alerta

  if (typeof alertaId !== 'string' || !alertaId) {
    return
  }

  const sensor = sensorsStore.sensors.find((item) => item.id === alertaId.toUpperCase())

  if (sensor) {
    editAlerts(sensor)
  }

  void router.replace({ name: 'sensors' })
}

onMounted(() => {
  if (!sensorsStore.sensors.length) {
    void sensorsStore.loadDashboardData().then(openAlertsFromQuery)
    return
  }

  openAlertsFromQuery()
})

const saveSettings = async () => {
  if (!editingSensorId.value) {
    return
  }

  settingsError.value = ''

  if (!settingsForm.name.trim()) {
    settingsError.value = 'El nombre del tinaco es obligatorio.'
    return
  }

  if (settingsForm.waterDistanceCm >= settingsForm.tankHeightCm) {
    settingsError.value = 'La distancia al agua debe ser menor que la altura del tinaco.'
    return
  }

  try {
    await sensorsStore.updateSensorSettings(editingSensorId.value, {
      name: settingsForm.name,
      maxCapacityLiters: Number(settingsForm.maxCapacityLiters),
      tankHeightCm: Number(settingsForm.tankHeightCm),
      waterDistanceCm: Number(settingsForm.waterDistanceCm),
      measurementIntervalMinutes: Number(settingsForm.measurementIntervalMinutes),
    })

    editingSensorId.value = null
  } catch (error) {
    settingsError.value =
      error instanceof Error ? error.message : 'No se pudieron guardar los cambios.'
  }
}

const saveAlerts = async () => {
  if (!alertSensorId.value) {
    return
  }

  settingsError.value = ''
  alertsError.value = ''

  if (alertsForm.lowWater) {
    const threshold = Number(alertsForm.lowWaterThresholdPercent)
    if (!Number.isFinite(threshold) || threshold < 1 || threshold > 100) {
      alertsError.value = 'El umbral debe ser un número entre 1 y 100.'
      return
    }
  }

  try {
    await sensorsStore.updateSensorAlerts(alertSensorId.value, {
      disconnect: alertsForm.disconnect,
      lowWater: alertsForm.lowWater,
      lowWaterThresholdPercent: Number(alertsForm.lowWaterThresholdPercent),
      notificationMethod: alertsForm.notificationMethod,
      cooldownMinutes: Number(alertsForm.cooldownMinutes),
    })

    alertSensorId.value = null
  } catch (error) {
    alertsError.value =
      error instanceof Error ? error.message : 'No se pudieron guardar las alertas.'
  }
}

const closeRegisterModal = () => {
  isRegisterModalOpen.value = false
  registerError.value = ''
}

const closeSettingsModal = () => {
  editingSensorId.value = null
  settingsError.value = ''
}

const closeAlertsModal = () => {
  alertSensorId.value = null
  alertsError.value = ''
}

const openUnlinkModal = (sensor: Sensor) => {
  unlinkConfirmSensor.value = sensor
}

const closeUnlinkModal = () => {
  unlinkConfirmSensor.value = null
}

const confirmUnlink = async () => {
  const sensor = unlinkConfirmSensor.value

  if (!sensor) {
    return
  }

  const id = sensor.id

  if (editingSensorId.value === id) {
    editingSensorId.value = null
  }

  if (alertSensorId.value === id) {
    alertSensorId.value = null
  }

  await sensorsStore.unlinkSensor(id)
  unlinkConfirmSensor.value = null
}
</script>

<template>
  <AuthenticatedLayout>
    <section class="page-header">
      <div>
        <p class="eyebrow">Sensores</p>
        <h1>Tinacos registrados</h1>
      </div>
      <button class="button" type="button" @click="isRegisterModalOpen = true">
        Registrar nuevo sensor
      </button>
    </section>

    <section class="panel panel--table">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Intervalo</th>
              <th>Última lectura</th>
              <th>Hace</th>
              <th>Configuraciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sensor in sensorsStore.sensors" :key="sensor.id">
              <td>{{ sensor.id }}</td>
              <td>
                <RouterLink class="sensor-table__link" :to="{ name: 'sensor-detail', params: { id: sensor.id } }">
                  {{ sensor.name }}
                </RouterLink>
              </td>
              <td>
                <span class="status-pill" :class="`status-pill--${sensor.status}`">
                  {{ getSensorStatusLabel(sensor.status) }}
                </span>
              </td>
              <td>Cada {{ sensor.measurementIntervalMinutes }} min</td>
              <td>{{ sensor.lastReadingPercent }}% · {{ formatLiters(sensor.currentLiters) }}</td>
              <td>{{ formatRelativeTime(sensor.lastReadingAt) }}</td>
              <td>
                <div class="table-actions">
                  <button
                    class="button button--small button--ghost"
                    type="button"
                    aria-label="Editar configuracion"
                    title="Editar configuracion"
                    @click="editSettings(sensor)"
                  >
                    <AppIcon name="Settings" :size="18" />
                  </button>
                  <button
                    class="button button--small button--ghost"
                    type="button"
                    aria-label="Configurar alertas"
                    title="Configurar alertas"
                    @click="editAlerts(sensor)"
                  >
                    <AppIcon name="BellRing" :size="18" />
                  </button>
                  <button
                    class="button button--small button--danger"
                    type="button"
                    aria-label="Desvincular tinaco"
                    title="Desvincular tinaco"
                    @click="openUnlinkModal(sensor)"
                  >
                    <AppIcon name="Unlink" :size="18" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!sensorsStore.sensors.length">
              <td class="empty-table-cell" colspan="7">No hay tinacos registrados. Agrega un sensor para comenzar.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <Teleport to="body">
      <div v-if="isRegisterModalOpen" class="modal-backdrop" role="presentation" @click.self="closeRegisterModal">
        <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="register-sensor-title">
          <div class="modal-card__header">
            <div>
              <p class="eyebrow">Nuevo sensor</p>
              <h2 id="register-sensor-title">Registrar sensor por ID</h2>
            </div>
            <button class="modal-close" type="button" aria-label="Cerrar" @click="closeRegisterModal">
              <AppIcon name="X" :size="18" />
            </button>
          </div>

          <form class="modal-form" @submit.prevent="submitSensor">
            <p class="form-help">
              Los sensores son dados de alta manualmente por el administrador. Ingresa el ID único de
              {{ SENSOR_ID_LENGTH }} caracteres alfanuméricos para vincularlo a tus tinacos registrados.
            </p>

            <label>
              ID del sensor
              <input
                v-model.trim="form.id"
                type="text"
                required
                :maxlength="SENSOR_ID_LENGTH"
                :pattern="sensorIdPattern"
                placeholder="TINC04"
                autocomplete="off"
                spellcheck="false"
                @input="form.id = form.id.toUpperCase()"
              />
            </label>
            <p v-if="form.id && !isSensorIdValid" class="error-message">
              El ID debe tener exactamente {{ SENSOR_ID_LENGTH }} caracteres alfanuméricos.
            </p>
            <p v-if="registerError" class="form-error">{{ registerError }}</p>

            <div class="form-actions">
              <button class="button" type="submit" :disabled="!isSensorIdValid">
                Guardar sensor
              </button>
              <button class="button button--secondary" type="button" @click="closeRegisterModal">
                Cancelar
              </button>
            </div>
          </form>
        </section>
      </div>

      <div v-if="editingSensorId" class="modal-backdrop" role="presentation" @click.self="closeSettingsModal">
        <section class="modal-card modal-card--wide" role="dialog" aria-modal="true" aria-labelledby="settings-title">
          <div class="modal-card__header">
            <div>
              <p class="eyebrow">Configuración</p>
              <h2 id="settings-title">Editar parámetros del tinaco</h2>
            </div>
            <button class="modal-close" type="button" aria-label="Cerrar" @click="closeSettingsModal">
              <AppIcon name="X" :size="18" />
            </button>
          </div>

          <form class="modal-form modal-form--grid" @submit.prevent="saveSettings">
            <label>
              Nombre
              <input v-model="settingsForm.name" type="text" required maxlength="120" />
            </label>

            <label>
              Capacidad (L)
              <input
                v-model.number="settingsForm.maxCapacityLiters"
                type="number"
                required
                min="1"
                :max="MAX_CAPACITY_LITERS"
                step="1"
              />
              <span class="field-hint">Máximo {{ MAX_CAPACITY_LITERS.toLocaleString('es-MX') }} L</span>
            </label>

            <label>
              Altura (cm)
              <input
                v-model.number="settingsForm.tankHeightCm"
                type="number"
                required
                min="1"
                :max="MAX_TANK_HEIGHT_CM"
                step="1"
              />
              <span class="field-hint">Máximo {{ MAX_TANK_HEIGHT_CM }} cm</span>
            </label>

            <label>
              Distancia al agua (cm)
              <input
                v-model.number="settingsForm.waterDistanceCm"
                type="number"
                required
                min="0"
                :max="MAX_WATER_DISTANCE_CM"
                step="1"
              />
              <span class="field-hint">Máximo {{ MAX_WATER_DISTANCE_CM }} cm · no mayor que la altura</span>
            </label>

            <label>
              Intervalo de mediciones (min)
              <input
                v-model.number="settingsForm.measurementIntervalMinutes"
                type="number"
                required
                min="1"
                :max="MAX_MEASUREMENT_INTERVAL_MINUTES"
                step="1"
              />
              <span class="field-hint">Máximo {{ MAX_MEASUREMENT_INTERVAL_MINUTES }} min (24 horas)</span>
            </label>

            <p v-if="settingsError" class="form-error">{{ settingsError }}</p>

            <div class="form-actions">
              <button class="button" type="submit">Guardar cambios</button>
              <button class="button button--secondary" type="button" @click="closeSettingsModal">
                Cancelar
              </button>
            </div>
          </form>
        </section>
      </div>

      <div v-if="alertSensorId" class="modal-backdrop" role="presentation" @click.self="closeAlertsModal">
        <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="alerts-title">
          <div class="modal-card__header">
            <div>
              <p class="eyebrow">Alertas</p>
              <h2 id="alerts-title">Editar reglas de notificación</h2>
            </div>
            <button class="modal-close" type="button" aria-label="Cerrar" @click="closeAlertsModal">
              <AppIcon name="X" :size="18" />
            </button>
          </div>

          <form class="modal-form" @submit.prevent="saveAlerts">
            <label class="checkbox-field">
              <input v-model="alertsForm.disconnect" type="checkbox" />
              Alertar por desconexión
            </label>

            <label class="checkbox-field">
              <input v-model="alertsForm.lowWater" type="checkbox" />
              Alertar por nivel bajo del agua
            </label>

            <label>
              Umbral de nivel bajo (%)
              <input
                v-model.number="alertsForm.lowWaterThresholdPercent"
                type="number"
                required
                min="1"
                max="100"
                :disabled="isLowWaterThresholdDisabled"
              />
            </label>

            <label>
              Método de notificación
              <select v-model="alertsForm.notificationMethod">
                <option value="EMAIL">Correo electrónico</option>
                <option value="SMS">SMS</option>
              </select>
            </label>

            <label>
              Tiempo entre alertas repetidas (minutos)
              <input
                v-model.number="alertsForm.cooldownMinutes"
                type="number"
                required
                min="1"
                max="1440"
              />
              <span class="field-hint">Máximo 1440 min (24 horas). Evita notificaciones duplicadas.</span>
            </label>

            <p v-if="alertsError" class="form-error">{{ alertsError }}</p>

            <div class="form-actions">
              <button class="button" type="submit" :disabled="!canSaveAlerts">
                Guardar alertas
              </button>
              <button class="button button--secondary" type="button" @click="closeAlertsModal">
                Cancelar
              </button>
            </div>
          </form>
        </section>
      </div>

      <div
        v-if="unlinkConfirmSensor"
        class="modal-backdrop"
        role="presentation"
        @click.self="closeUnlinkModal"
      >
        <section
          class="modal-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unlink-title"
          aria-describedby="unlink-desc"
        >
          <div class="modal-card__header">
            <div>
              <p class="eyebrow">Confirmar</p>
              <h2 id="unlink-title">Desvincular tinaco</h2>
            </div>
            <button class="modal-close" type="button" aria-label="Cerrar" @click="closeUnlinkModal">
              <AppIcon name="X" :size="18" />
            </button>
          </div>

          <p id="unlink-desc" class="modal-confirm-text">
            ¿Estás seguro de que quieres desvincular <strong>{{ unlinkConfirmSensor.name }}</strong>?
          </p>
          <p class="form-help">Podrás volver a vincularlo más tarde con el mismo ID del sensor.</p>

          <div class="form-actions">
            <button class="button button--danger-solid" type="button" @click="confirmUnlink">Desvincular</button>
            <button class="button button--secondary" type="button" @click="closeUnlinkModal">Cancelar</button>
          </div>
        </section>
      </div>
    </Teleport>
  </AuthenticatedLayout>
</template>
