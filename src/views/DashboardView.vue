<script setup lang="ts">
/**
 * DashboardView - Panel de control principal de la aplicación
 *
 * Muestra:
 * - Resumen visual de todos los sensores registrados (con gauges)
 * - Métricas clave por sensor (capacidad, estado, última actualización)
 * - Gráfico histórico general de niveles de agua
 * - Selector de rango temporal (24h, 7d, 30d)
 *
 * Los sensores son clicables y llevan a la vista detallada individual.
 *
 * @component
 */
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import AuthenticatedLayout from '@/components/AuthenticatedLayout.vue'
import WaterLevelGauge from '@/components/WaterLevelGauge.vue'
import { useSensorsStore } from '@/stores/sensors'
import { formatDateTime, formatLiters, formatRelativeTime, getSensorStatusLabel } from '@/utils/format'

const sensorsStore = useSensorsStore()

/**
 * Tipos de rango temporal disponibles
 */
type RangeKey = '24h' | '7d' | '30d'

// Rango temporal seleccionado por defecto
const selectedRange = ref<RangeKey>('24h')

/**
 * Opciones de rango temporal para filtrar histórico
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
 * Obtiene la configuración del rango temporal seleccionado
 * @returns {object} Configuración con duración en milisegundos
 */
const selectedRangeConfig = computed(
  () => rangeOptions.find((option) => option.key === selectedRange.value) ?? rangeOptions[0],
)

/**
 * Filtra lecturas según el rango temporal seleccionado
 * @returns {Reading[]} Array de lecturas dentro del rango
 */
const filteredReadings = computed(() => {
  const sortedReadings = sensorsStore.readings
    .slice()
    .sort((first, second) => new Date(first.measuredAt).getTime() - new Date(second.measuredAt).getTime())

  if (sortedReadings.length === 0) {
    return []
  }

  const latestTimestamp = new Date(sortedReadings[sortedReadings.length - 1].measuredAt).getTime()
  const startTimestamp = latestTimestamp - selectedRangeConfig.value.milliseconds

  return sortedReadings.filter((reading) => new Date(reading.measuredAt).getTime() >= startTimestamp)
})

/**
 * Redimensiona las lecturas a máximo 60 puntos para el gráfico
 * Evita saturación visual con muchos datos
 * @returns {Reading[]} Array de lecturas optimizadas para render
 */
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

<template>
  <AuthenticatedLayout>
    <section class="page-header">
      <div>
        <p class="eyebrow">Panel de control</p>
        <h1>Resumen de tus tinacos</h1>
      </div>
      <span class="summary-pill">{{ sensorsStore.sensors.length }} sensores registrados</span>
    </section>

    <section class="sensor-grid" aria-label="Sensores registrados">
      <RouterLink
        v-for="sensor in sensorsStore.sensors"
        :key="sensor.id"
        :to="{ name: 'sensor-detail', params: { id: sensor.id } }"
        class="sensor-card"
      >
        <div class="sensor-card__header">
          <div>
            <span class="sensor-card__id">{{ sensor.id }}</span>
            <h2>{{ sensor.name }}</h2>
          </div>
          <span class="status-pill" :class="`status-pill--${sensor.status}`">
            {{ getSensorStatusLabel(sensor.status) }}
          </span>
        </div>

        <div class="water-meter">
          <WaterLevelGauge :level="sensor.lastReadingPercent" :sensor-name="sensor.name" />
        </div>

        <dl class="metrics">
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
      </RouterLink>
    </section>

    <section class="panel">
      <div class="panel__header">
        <div>
          <p class="eyebrow">Historial</p>
          <h2>Medidas recientes</h2>
        </div>
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
        <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" role="img" aria-label="Evolución reciente del nivel de agua">
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
        <p class="reading-chart__x-title">Frecuencia de actualizacion (tiempo)</p>
      </div>

      <p v-else class="reading-chart__empty">Todavia no hay mediciones para mostrar.</p>
    </section>
  </AuthenticatedLayout>
</template>
