<script setup lang="ts">
import { reactive, ref } from 'vue'

import AuthenticatedLayout from '@/components/AuthenticatedLayout.vue'
import { useSensorsStore } from '@/stores/sensors'
import type { Sensor } from '@/types'
import { formatLiters, formatRelativeTime, getSensorStatusLabel } from '@/utils/format'

const sensorsStore = useSensorsStore()
const isRegisterModalOpen = ref(false)
const editingSensorId = ref<string | null>(null)
const alertSensorId = ref<string | null>(null)
const form = reactive({
  name: '',
  maxCapacityLiters: 1100,
  measurementIntervalMinutes: 15,
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
  await sensorsStore.addSensor({
    name: form.name,
    maxCapacityLiters: Number(form.maxCapacityLiters),
    measurementIntervalMinutes: Number(form.measurementIntervalMinutes),
  })

  form.name = ''
  form.maxCapacityLiters = 1100
  form.measurementIntervalMinutes = 15
  isRegisterModalOpen.value = false
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

  await sensorsStore.updateSensorSettings(editingSensorId.value, {
    name: settingsForm.name,
    maxCapacityLiters: Number(settingsForm.maxCapacityLiters),
    tankHeightCm: Number(settingsForm.tankHeightCm),
    waterDistanceCm: Number(settingsForm.waterDistanceCm),
    measurementIntervalMinutes: Number(settingsForm.measurementIntervalMinutes),
  })

  editingSensorId.value = null
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
}

const closeSettingsModal = () => {
  editingSensorId.value = null
}

const closeAlertsModal = () => {
  alertSensorId.value = null
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
              <h2 id="register-sensor-title">Registrar sensor</h2>
            </div>
            <button class="modal-close" type="button" aria-label="Cerrar" @click="closeRegisterModal">×</button>
          </div>

          <form class="modal-form" @submit.prevent="submitSensor">
            <label>
              Nombre del sensor
              <input v-model="form.name" type="text" required placeholder="Tinaco cocina" />
            </label>

            <label>
              Capacidad máxima en litros
              <input v-model.number="form.maxCapacityLiters" type="number" required min="1" />
            </label>

            <label>
              Intervalo de medición en minutos
              <input v-model.number="form.measurementIntervalMinutes" type="number" required min="1" />
            </label>

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
              <input v-model="settingsForm.name" type="text" required />
            </label>

            <label>
              Capacidad
              <input v-model.number="settingsForm.maxCapacityLiters" type="number" required min="1" />
            </label>

            <label>
              Altura (cm)
              <input v-model.number="settingsForm.tankHeightCm" type="number" required min="1" />
            </label>

            <label>
              Distancia al agua (cm)
              <input v-model.number="settingsForm.waterDistanceCm" type="number" required min="0" />
            </label>

            <label>
              Intervalo de mediciones (min)
              <input v-model.number="settingsForm.measurementIntervalMinutes" type="number" required min="1" />
            </label>

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
    </Teleport>
  </AuthenticatedLayout>
</template>
