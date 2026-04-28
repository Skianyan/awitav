<script setup lang="ts">
import { onMounted } from 'vue'

import AppSidebar from '@/components/AppSidebar.vue'
import { useSensorsStore } from '@/stores/sensors'

const sensorsStore = useSensorsStore()

onMounted(() => {
  if (!sensorsStore.sensors.length) {
    void sensorsStore.loadDashboardData()
  }
})
</script>

<template>
  <div class="app-shell">
    <AppSidebar />
    <main class="app-main">
      <slot />
    </main>
  </div>
</template>
