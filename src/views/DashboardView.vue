<script setup lang="ts">
import AuthenticatedLayout from '@/components/AuthenticatedLayout.vue'
import { useSensorsStore } from '@/stores/sensors'
import { formatDateTime, formatLiters, formatRelativeTime, getSensorStatusLabel } from '@/utils/format'

const sensorsStore = useSensorsStore()
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
      <article v-for="sensor in sensorsStore.sensors" :key="sensor.id" class="sensor-card">
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
          <span :style="{ width: `${sensor.lastReadingPercent}%` }"></span>
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
      </article>
    </section>

    <section class="panel">
      <div class="panel__header">
        <div>
          <p class="eyebrow">Historial</p>
          <h2>Medidas recientes</h2>
        </div>
      </div>

      <div class="reading-list">
        <article v-for="reading in sensorsStore.recentReadings" :key="reading.id" class="reading-row">
          <div>
            <strong>
              {{ sensorsStore.sensors.find((sensor) => sensor.id === reading.sensorId)?.name }}
            </strong>
            <span>{{ formatDateTime(reading.measuredAt) }}</span>
          </div>
          <div>
            <strong>{{ reading.percentage }}%</strong>
            <span>{{ formatLiters(reading.liters) }}</span>
          </div>
        </article>
      </div>
    </section>
  </AuthenticatedLayout>
</template>
