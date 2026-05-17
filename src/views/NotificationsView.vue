<script setup lang="ts">
import { computed, ref } from 'vue'
import AuthenticatedLayout from '@/components/AuthenticatedLayout.vue'
import { useSensorsStore } from '@/stores/sensors'
import { formatRelativeTime } from '@/utils/format'

const sensorsStore = useSensorsStore()
const isProcessing = ref(false)

const hasReadNotifications = computed(
  () => sensorsStore.notifications.some((item) => item.read),
)

const markAllRead = async () => {
  isProcessing.value = true
  try {
    await sensorsStore.markAllNotificationsAsRead()
  } finally {
    isProcessing.value = false
  }
}

const clearRead = async () => {
  isProcessing.value = true
  try {
    await sensorsStore.clearReadNotifications()
  } finally {
    isProcessing.value = false
  }
}

const markAsRead = async (notificationId: string) => {
  isProcessing.value = true
  try {
    await sensorsStore.markNotificationAsRead(notificationId)
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <AuthenticatedLayout>
    <section class="page-header">
      <div>
        <p class="eyebrow">Notificaciones</p>
        <h1>Alertas recientes</h1>
      </div>

      <div class="notification-actions">
        <span class="summary-pill">
          {{ sensorsStore.pendingNotifications.length }} sin atender
        </span>
        <div class="notification-actions__buttons">
          <button
            class="button button--secondary"
            type="button"
            @click="markAllRead"
            :disabled="isProcessing || !sensorsStore.pendingNotifications.length"
          >
            Marcar todas como leídas
          </button>
          <button
            class="button button--ghost"
            type="button"
            @click="clearRead"
            :disabled="isProcessing || !hasReadNotifications"
          >
            Limpiar leídas
          </button>
        </div>
      </div>
    </section>

    <section class="notification-list">
      <article
          v-for="notification in sensorsStore.notifications"
          :key="notification.id"
          class="notification-card"
          :class="[
            `notification-card--${notification.type}`,
            { 'notification-card--read': notification.read },
          ]"
        >
          <div class="notification-card__content">
            <div>
              <strong>{{ notification.message }}</strong>
              <span>{{ formatRelativeTime(notification.createdAt) }}</span>
            </div>
            <div class="notification-card__actions">
              <button
                v-if="!notification.read"
                class="button button--small button--secondary"
                type="button"
                @click="markAsRead(notification.id)"
                :disabled="isProcessing"
              >
                Marcar leída
              </button>
              <span v-else class="notification-card__status">Leída</span>
            </div>
          </div>
        </article>

        <article v-if="!sensorsStore.notifications.length" class="panel empty-state">
          <h2>Todo en orden</h2>
          <p>No tienes notificaciones por ahora.</p>
        </article>
      </section>
  </AuthenticatedLayout>
</template>
