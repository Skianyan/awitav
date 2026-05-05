<script setup lang="ts">
import { reactive, ref } from 'vue'

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
const sensorIdPattern = `[A-Za-z0-9]{${SENSOR_ID_LENGTH}}`
const isRegisterModalOpen = ref(false)
const editingSensorId = ref<string | null>(null)
const alertSensorId = ref<string | null>(null)
const unlinkConfirmSensor = ref<Sensor | null>(null)
const registerError = ref('')
const settingsError = ref('')
const form = reactive({
  id: '',
})
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
})

const submitSensor = async () => {
  registerError.value = ''

  try {
    await sensorsStore.addSensor({
      id: form.id,
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
}

const saveSettings = async () => {
  if (!editingSensorId.value) {
    return
  }

  settingsError.value = ''

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

  await sensorsStore.updateSensorAlerts(alertSensorId.value, {
    disconnect: alertsForm.disconnect,
    lowWater: alertsForm.lowWater,
    lowWaterThresholdPercent: Number(alertsForm.lowWaterThresholdPercent),
  })

  alertSensorId.value = null
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
              <td>{{ sensor.name }}</td>
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
                    &#9881;
                  </button>
                  <button
                    class="button button--small button--ghost"
                    type="button"
                    aria-label="Configurar alertas"
                    title="Configurar alertas"
                    @click="editAlerts(sensor)"
                  >
                    &#128276;
                  </button>
                  <button
                    class="button button--small button--danger"
                    type="button"
                    aria-label="Desvincular tinaco"
                    title="Desvincular tinaco"
                    @click="openUnlinkModal(sensor)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m13.82 10.18 5.66-5.66a2 2 0 0 0-2.83-2.83l-5.66 5.66" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="m10.18 13.82-5.66 5.66a2 2 0 1 0 2.83 2.83l5.66-5.66" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="m16.95 16.95 2.12 2.12M5 5l2.12 2.12" />
                    </svg>
                  </button>
                </div>
              </td>
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
            <button class="modal-close" type="button" aria-label="Cerrar" @click="closeRegisterModal">×</button>
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

            <p v-if="registerError" class="form-error">{{ registerError }}</p>

            <div class="form-actions">
              <button class="button" type="submit">Guardar sensor</button>
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
            <button class="modal-close" type="button" aria-label="Cerrar" @click="closeSettingsModal">×</button>
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
            <button class="modal-close" type="button" aria-label="Cerrar" @click="closeAlertsModal">×</button>
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
              />
            </label>

            <div class="form-actions">
              <button class="button" type="submit">Guardar alertas</button>
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
            <button class="modal-close" type="button" aria-label="Cerrar" @click="closeUnlinkModal">×</button>
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
