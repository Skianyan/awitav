<script setup lang="ts">
import AuthenticatedLayout from '@/components/AuthenticatedLayout.vue'
import { useSensorsStore } from '@/stores/sensors'
import { formatRelativeTime } from '@/utils/format'

const sensorsStore = useSensorsStore()
</script>

<template>
  <AuthenticatedLayout>
    <section class="page-header">
      <div>
        <p class="eyebrow">Notificaciones</p>
        <h1>Pendientes</h1>
      </div>
      <span class="summary-pill">
        {{ sensorsStore.pendingNotifications.length }} sin atender
      </span>
    </section>

    <section class="notification-list">
      <article
        v-for="notification in sensorsStore.pendingNotifications"
        :key="notification.id"
        class="notification-card"
        :class="`notification-card--${notification.type}`"
      >
        <div>
          <strong>{{ notification.message }}</strong>
          <span>{{ formatRelativeTime(notification.createdAt) }}</span>
        </div>
      </article>

      <article v-if="!sensorsStore.pendingNotifications.length" class="panel empty-state">
        <h2>Todo en orden</h2>
        <p>No tienes notificaciones pendientes por ahora.</p>
      </article>
    </section>
  </AuthenticatedLayout>
</template>
