<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { useSensorsStore } from '@/stores/sensors'

const auth = useAuthStore()
const sensorsStore = useSensorsStore()
const router = useRouter()

const navigation = [
  { label: 'Panel de control', routeName: 'dashboard' },
  { label: 'Sensores', routeName: 'sensors' },
  { label: 'Notificaciones', routeName: 'notifications' },
]

const logout = async () => {
  auth.logout()
  await router.push({ name: 'landing' })
}
</script>

<template>
  <aside class="sidebar">
    <div>
      <RouterLink class="brand" :to="{ name: 'dashboard' }">
        <span class="brand__mark">A</span>
        <span>
          <strong>AWITA</strong>
          <small>Agua bajo control</small>
        </span>
      </RouterLink>

      <nav class="sidebar__nav" aria-label="Navegación principal">
        <RouterLink
          v-for="item in navigation"
          :key="item.routeName"
          class="sidebar__link"
          :to="{ name: item.routeName }"
        >
          <span>{{ item.label }}</span>
          <span v-if="item.routeName === 'notifications'" class="badge">
            {{ sensorsStore.pendingNotifications.length }}
          </span>
        </RouterLink>
      </nav>
    </div>

    <div class="sidebar__user">
      <span>Usuario activo</span>
      <strong>{{ auth.user?.email }}</strong>
      <button class="button button--ghost" type="button" @click="logout">Cerrar sesión</button>
    </div>
  </aside>
</template>
