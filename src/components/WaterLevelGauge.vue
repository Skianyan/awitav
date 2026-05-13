<template>
  <div class="water-level-gauge">
    <svg :width="width" :height="height" viewBox="0 0 200 300">
      <!-- Tank outline -->
      <rect x="50" y="50" width="100" height="200" fill="none" stroke="#ccc" stroke-width="2" rx="10" />

      <!-- Water level -->
      <rect
        x="50"
        :y="250 - (level / 100) * 200"
        width="100"
        :height="(level / 100) * 200"
        :fill="levelColor"
        rx="10"
      />

      <!-- Tank top -->
      <rect x="40" y="40" width="120" height="20" fill="#f0f0f0" stroke="#ccc" stroke-width="2" rx="10" />

      <!-- Level text -->
      <text x="100" y="280" text-anchor="middle" font-size="14" fill="#333">
        {{ Math.round(level) }}%
      </text>

      <!-- Sensor name -->
      <text x="100" y="30" text-anchor="middle" font-size="12" fill="#666">
        {{ sensorName }}
      </text>
    </svg>
  </div>
</template>

<script setup lang="ts">
/**
 * WaterLevelGauge - Componente visual para mostrar nivel de agua en tinaco
 *
 * Renderiza un SVG con forma de tinaco que muestra visualmente el nivel de agua
 * con colores que varían según el porcentaje:
 * - Rojo (#ff4444): Nivel bajo (< 25%)
 * - Naranja (#ffaa00): Nivel medio (25-50%)
 * - Verde (#44aa44): Nivel alto (> 50%)
 *
 * @component
 * @example
 * <WaterLevelGauge :level="75" sensor-name="Tinaco Principal" />
 */
import { computed } from 'vue'

/**
 * Props del componente WaterLevelGauge
 * @interface Props
 * @property {number} level - Porcentaje de agua (0-100)
 * @property {string} sensorName - Nombre del sensor/tinaco a mostrar
 */
interface Props {
  level: number
  sensorName: string
}

const props = defineProps<Props>()

// Dimensiones del SVG
const width = 200
const height = 300

/**
 * Calcula el color del agua según el nivel
 * @returns {string} Color en hexadecimal
 */
const levelColor = computed(() => {
  if (props.level < 25) return '#ff4444' // Rojo - Nivel bajo
  if (props.level < 50) return '#ffaa00' // Naranja - Nivel medio
  return '#44aa44' // Verde - Nivel alto
})
</script>

<style scoped>
.water-level-gauge {
  display: inline-block;
}
</style>