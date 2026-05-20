<script setup lang="ts">
import {
  Bell,
  BellRing,
  EllipsisVertical,
  Gauge,
  LayoutDashboard,
  Settings,
  Unlink,
  User,
  X,
} from '@lucide/vue'
import { computed } from 'vue'

const iconMap = {
  LayoutDashboard,
  Gauge,
  Bell,
  User,
  EllipsisVertical,
  Settings,
  BellRing,
  Unlink,
  X,
} as const

export type AppIconName = keyof typeof iconMap

const props = withDefaults(
  defineProps<{
    name: AppIconName
    size?: number
    strokeWidth?: number
  }>(),
  {
    size: 18,
    strokeWidth: 2,
  },
)

const iconComponent = computed(() => iconMap[props.name])
</script>

<template>
  <component
    :is="iconComponent"
    class="app-icon"
    :size="size"
    :stroke-width="strokeWidth"
    aria-hidden="true"
  />
</template>
