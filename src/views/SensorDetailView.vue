<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import AuthenticatedLayout from '@/components/AuthenticatedLayout.vue'
import WaterLevelGauge from '@/components/WaterLevelGauge.vue'
import { useSensorsStore } from '@/stores/sensors'
import type { ReadingTimeRange } from '@/types'
import {
  formatCooldownMinutes,
  formatDateTime,
  formatLiters,
  formatNotificationMethod,
  formatRelativeTime,
  getSensorStatusLabel,
} from '@/utils/format'

const route = useRoute()
const sensorsStore = useSensorsStore()

const selectedRange = ref<ReadingTimeRange>('24h')
const loadError = ref('')

const rangeOptions: Array<{ key: ReadingTimeRange; label: string }> = [
  { key: '24h', label: 'Ultimas 24 horas' },
  { key: '7d', label: 'Ultima semana' },
  { key: '30d', label: 'Ultimo mes' },
]

const chartWidth = 720
const chartHeight = 260
const chartPaddingX = 66
const chartPaddingY = 26

const sensorId = computed(() => String(route.params.id ?? ''))

const sensor = computed(() => sensorsStore.sensors.find((item) => item.id === sensorId.value))

const sensorReadings = computed(() => sensorsStore.getSensorReadings(sensorId.value))

const chartReadings = computed(() => {
  const sorted = sensorReadings.value
    .slice()
    .sort((first, second) => new Date(first.measuredAt).getTime() - new Date(second.measuredAt).getTime())

  if (sorted.length <= 60) {
    return sorted
  }

  const step = Math.ceil(sorted.length / 60)
  return sorted.filter((_, index) => index % step === 0)
})

const chartPoints = computed(() => {
  if (chartReadings.value.length === 0) {
    return []
  }

  const drawableWidth = chartWidth - chartPaddingX * 2
  const drawableHeight = chartHeight - chartPaddingY * 2

  if (chartReadings.value.length === 1) {
    return [
      {
        id: chartReadings.value[0].id,
        x: chartWidth / 2,
        y: chartPaddingY + drawableHeight - (chartReadings.value[0].percentage / 100) * drawableHeight,
        percentage: chartReadings.value[0].percentage,
      },
    ]
  }

  return chartReadings.value.map((reading, index) => {
    const ratio = index / (chartReadings.value.length - 1)
    return {
      id: reading.id,
      x: chartPaddingX + ratio * drawableWidth,
      y: chartPaddingY + drawableHeight - (reading.percentage / 100) * drawableHeight,
      percentage: reading.percentage,
    }
  })
})

const chartPolyline = computed(() => chartPoints.value.map((point) => `${point.x},${point.y}`).join(' '))

const xAxisLabels = computed(() => {
  if (chartReadings.value.length === 0) {
    return []
  }

  if (chartReadings.value.length === 1) {
    return [{ key: chartReadings.value[0].id, label: formatDateTime(chartReadings.value[0].measuredAt) }]
  }

  const firstIndex = 0
  const middleIndex = Math.floor((chartReadings.value.length - 1) / 2)
  const lastIndex = chartReadings.value.length - 1

  return [firstIndex, middleIndex, lastIndex].map((index) => ({
    key: chartReadings.value[index].id,
    label: formatDateTime(chartReadings.value[index].measuredAt),
  }))
})

async function loadDetail() {
  if (!sensorId.value) {
    return
  }

  loadError.value = ''

  try {
    await sensorsStore.loadSensorDetail(sensorId.value, selectedRange.value)
  } catch (error) {
    loadError.value =
      error instanceof Error ? error.message : 'No se pudo cargar el detalle del sensor.'
  }
}

watch([sensorId, selectedRange], () => {
  void loadDetail()
}, { immediate: true })
</script>

<template>
  <AuthenticatedLayout>
    <section class="page-header">
      <div>
        <p class="eyebrow">Sensor</p>
        <h1>{{ sensor?.name || 'Detalle del tinaco' }}</h1>
      </div>
      <div class="page-header__actions">
        <RouterLink
          v-if="sensor"
          :to="{ name: 'sensors', query: { alerta: sensor.id } }"
          class="button button--secondary"
        >
          Configurar alertas
        </RouterLink>
        <RouterLink :to="{ name: 'sensors' }" class="button button--ghost">
          Volver a sensores
        </RouterLink>
      </div>
    </section>

    <p v-if="loadError" class="form-error">{{ loadError }}</p>

    <p v-else-if="sensorsStore.isLoading && !sensor" class="reading-chart__empty">Cargando sensor...</p>

    <div v-else-if="sensor" class="sensor-detail">
      <div class="sensor-info">
        <WaterLevelGauge :level="sensor.lastReadingPercent" :sensor-name="sensor.name" />
        <dl class="metrics">
          <div>
            <dt>ID</dt>
            <dd>{{ sensor.id }}</dd>
          </div>
          <div>
            <dt>Estado</dt>
            <dd>
              <span class="status-pill" :class="`status-pill--${sensor.status}`">
                {{ getSensorStatusLabel(sensor.status) }}
              </span>
            </dd>
          </div>
          <div>
            <dt>Capacidad máxima</dt>
            <dd>{{ formatLiters(sensor.maxCapacityLiters) }}</dd>
          </div>
          <div>
            <dt>Capacidad actual</dt>
            <dd>{{ formatLiters(sensor.currentLiters) }} · {{ sensor.lastReadingPercent }}%</dd>
          </div>
          <div>
            <dt>Intervalo de medición</dt>
            <dd>Cada {{ sensor.measurementIntervalMinutes }} min</dd>
          </div>
          <div>
            <dt>Última actualización</dt>
            <dd>{{ formatRelativeTime(sensor.lastReadingAt) }}</dd>
          </div>
          <div>
            <dt>Alertas</dt>
            <dd>
              Desconexión: {{ sensor.alerts.disconnect ? 'Activa' : 'Inactiva' }} · Nivel bajo:
              {{ sensor.alerts.lowWater ? `Activa (${sensor.alerts.lowWaterThresholdPercent}%)` : 'Inactiva' }}
            </dd>
          </div>
          <div>
            <dt>Notificaciones</dt>
            <dd>
              {{ formatNotificationMethod(sensor.alerts.notificationMethod) }} · cada
              {{ formatCooldownMinutes(sensor.alerts.cooldownMinutes) }}
            </dd>
          </div>
        </dl>
      </div>

      <div class="sensor-chart panel">
        <div class="panel__header">
          <h2>Historial de niveles</h2>
          <label class="chart-range-select">
            Rango
            <select
              v-model="selectedRange"
              aria-label="Rango del historial"
              :disabled="sensorsStore.isLoading"
            >
              <option v-for="option in rangeOptions" :key="option.key" :value="option.key">
                {{ option.label }}
              </option>
            </select>
          </label>
        </div>

        <p v-if="sensorsStore.isLoading" class="reading-chart__empty">Cargando historial...</p>

        <div v-else-if="chartPoints.length > 0" class="reading-chart">
          <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" role="img" aria-label="Evolución del nivel de agua">
            <line
              v-for="gridValue in [0, 25, 50, 75, 100]"
              :key="gridValue"
              class="reading-chart__grid"
              :x1="chartPaddingX"
              :x2="chartWidth - chartPaddingX"
              :y1="chartPaddingY + ((100 - gridValue) / 100) * (chartHeight - chartPaddingY * 2)"
              :y2="chartPaddingY + ((100 - gridValue) / 100) * (chartHeight - chartPaddingY * 2)"
            />
            <text
              v-for="gridValue in [0, 25, 50, 75, 100]"
              :key="`y-label-${gridValue}`"
              class="reading-chart__axis-value"
              :x="chartPaddingX - 12"
              :y="chartPaddingY + ((100 - gridValue) / 100) * (chartHeight - chartPaddingY * 2) + 4"
            >
              {{ gridValue }}%
            </text>

            <polyline class="reading-chart__line" :points="chartPolyline" />

            <g v-for="point in chartPoints" :key="point.id">
              <circle class="reading-chart__point" :cx="point.x" :cy="point.y" r="4.5" />
              <text class="reading-chart__value" :x="point.x" :y="point.y - 10">{{ point.percentage }}%</text>
            </g>

            <text class="reading-chart__axis-title" :x="18" :y="chartHeight / 2" transform="rotate(-90 18 130)">
              Porcentaje
            </text>
          </svg>

          <div class="reading-chart__labels">
            <span v-for="axisLabel in xAxisLabels" :key="`label-${axisLabel.key}`">
              {{ axisLabel.label }}
            </span>
          </div>
        </div>

        <p v-else class="reading-chart__empty">No hay mediciones en el rango seleccionado.</p>
      </div>
    </div>

    <div v-else class="panel empty-state">
      <h2>Sensor no encontrado</h2>
      <p>El sensor que buscas no existe en tu cuenta o no tienes acceso.</p>
      <RouterLink :to="{ name: 'sensors' }" class="button button--secondary">Volver a sensores</RouterLink>
    </div>
  </AuthenticatedLayout>
</template>

<style scoped>
.sensor-detail {
  display: grid;
  grid-template-columns: minmax(16rem, 1fr) minmax(0, 2fr);
  gap: 2rem;
}

.sensor-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metrics {
  width: 100%;
  margin-top: 1rem;
  display: grid;
  gap: 0.75rem;
}

.metrics dt {
  font-weight: 700;
  color: #25384d;
}

.metrics dd {
  margin: 0.15rem 0 0;
  color: #526477;
}

.panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.panel__header h2 {
  margin: 0;
}

.chart-range-select {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #526477;
  font-weight: 600;
}

@media (max-width: 860px) {
  .sensor-detail {
    grid-template-columns: 1fr;
  }
}
</style>
