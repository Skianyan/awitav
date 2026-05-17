<template>
  <AuthenticatedLayout>
    <section class="page-header">
      <div>
        <p class="eyebrow">Sensor</p>
        <h1>{{ sensor?.name || 'Sensor no encontrado' }}</h1>
      </div>
      <router-link to="/sensores" class="button button--secondary">Volver a sensores</router-link>
    </section>

    <div v-if="sensor" class="sensor-detail">
      <div class="sensor-info">
        <WaterLevelGauge :level="sensor.lastReadingPercent" :sensor-name="sensor.name" />
        <dl class="metrics">
          <div>
            <dt>ID</dt>
            <dd>{{ sensor.id }}</dd>
          </div>
          <div>
            <dt>Estado</dt>
            <dd>{{ getSensorStatusLabel(sensor.status) }}</dd>
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
            <dt>Última actualización</dt>
            <dd>{{ formatRelativeTime(sensor.lastReadingAt) }}</dd>
          </div>
        </dl>
      </div>

      <div class="sensor-chart">
        <div class="panel__header">
          <h2>Historial de niveles</h2>
          <label class="chart-range-select">
            Rango
            <select v-model="selectedRange" aria-label="Rango del historial">
              <option v-for="option in rangeOptions" :key="option.key" :value="option.key">
                {{ option.label }}
              </option>
            </select>
          </label>
        </div>
        <div v-if="chartPoints.length > 0" class="reading-chart">
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
        <p v-else>Sensor no encontrado o sin datos de historial disponibles.</p>
      </div>
    </div>
    <div v-else class="panel empty-state">
      <h2>Sensor no encontrado</h2>
      <p>El sensor que buscas no existe en tu cuenta.</p>
      <router-link to="/sensores" class="button button--secondary">Volver a sensores</router-link>
    </div>
  </AuthenticatedLayout>
</template>

<script setup lang="ts">
/**
 * SensorDetailView - Vista detallada de un sensor individual
 *
 * Muestra información completa de un sensor específico incluyendo:
 * - Gauge visual del nivel actual
 * - Métricas detalladas (ID, estado, capacidad, última actualización)
 * - Gráfico histórico de niveles de agua con opciones de rango temporal
 *
 * Los datos se obtienen del store de sensores basado en el ID de ruta.
 *
 * @component
 * @example
 * // Accesible a través de /sensor/:id
 * // ej: /sensor/ABC123
 */
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import AuthenticatedLayout from '@/components/AuthenticatedLayout.vue'
import WaterLevelGauge from '@/components/WaterLevelGauge.vue'
import { useSensorsStore } from '@/stores/sensors'
import { formatDateTime, formatLiters, formatRelativeTime, getSensorStatusLabel } from '@/utils/format'

const route = useRoute()
const sensorsStore = useSensorsStore()

/**
 * Tipos de rango temporal disponibles para el gráfico
 */
type RangeKey = '24h' | '7d' | '30d'

// Rango temporal seleccionado por defecto
const selectedRange = ref<RangeKey>('24h')

/**
 * Opciones de rango temporal para filtrar datos históricos
 */
const rangeOptions: Array<{ key: RangeKey; label: string; milliseconds: number }> = [
  { key: '24h', label: 'Ultimas 24 horas', milliseconds: 24 * 60 * 60 * 1000 },
  { key: '7d', label: 'Ultima semana', milliseconds: 7 * 24 * 60 * 60 * 1000 },
  { key: '30d', label: 'Ultimo mes', milliseconds: 30 * 24 * 60 * 60 * 1000 },
]

// Dimensiones del gráfico
const chartWidth = 720
const chartHeight = 260
const chartPaddingX = 66
const chartPaddingY = 26

/**
 * Obtiene el sensor actual basado en el ID de ruta
 * @returns {Sensor | undefined} El sensor encontrado o undefined
 */
const sensor = computed(() =>
  sensorsStore.sensors.find((s) => s.id === route.params.id)
)

/**
 * Obtiene la configuración del rango seleccionado
 * @returns {object} Configuración del rango con tiempo en milisegundos
 */
const selectedRangeConfig = computed(
  () => rangeOptions.find((option) => option.key === selectedRange.value) ?? rangeOptions[0],
)

/**
 * Filtra las lecturas del sensor actual
 * @returns {Reading[]} Array de lecturas del sensor
 */
const sensorReadings = computed(() =>
  sensorsStore.readings.filter((r) => r.sensorId === sensor.value?.id)
)

/**
 * Filtra las lecturas según el rango temporal seleccionado
 * @returns {Reading[]} Array de lecturas dentro del rango
 */
const filteredReadings = computed(() => {
  const sortedReadings = sensorReadings.value
    .slice()
    .sort((first, second) => new Date(first.measuredAt).getTime() - new Date(second.measuredAt).getTime())

  if (sortedReadings.length === 0) {
    return []
  }

  const latestTimestamp = new Date(sortedReadings[sortedReadings.length - 1].measuredAt).getTime()
  const startTimestamp = latestTimestamp - selectedRangeConfig.value.milliseconds

  return sortedReadings.filter((reading) => new Date(reading.measuredAt).getTime() >= startTimestamp)
})

const chartReadings = computed(() => {
  if (filteredReadings.value.length <= 60) {
    return filteredReadings.value
  }

  const step = Math.ceil(filteredReadings.value.length / 60)
  return filteredReadings.value.filter((_, index) => index % step === 0)
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
        measuredAt: chartReadings.value[0].measuredAt,
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
      measuredAt: reading.measuredAt,
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
</script>

<style scoped>
.sensor-detail {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

.sensor-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metrics {
  margin-top: 1rem;
  display: grid;
  gap: 0.5rem;
}

.metrics dt {
  font-weight: bold;
}

.metrics dd {
  margin: 0;
}

.panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-range-select {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reading-chart {
  margin-top: 1rem;
}

.reading-chart__grid {
  stroke: #e0e0e0;
  stroke-width: 1;
}

.reading-chart__axis-value {
  font-size: 12px;
  fill: #666;
}

.reading-chart__line {
  fill: none;
  stroke: #007acc;
  stroke-width: 2;
}

.reading-chart__point {
  fill: #007acc;
}

.reading-chart__value {
  font-size: 10px;
  fill: #333;
  text-anchor: middle;
}

.reading-chart__axis-title {
  font-size: 12px;
  fill: #666;
}

.reading-chart__labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 12px;
  color: #666;
}
</style>