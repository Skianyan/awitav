<script setup lang="ts">
import { watch } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

watch(
  [() => auth.isClerkLoaded, () => auth.isAuthenticated],
  ([loaded, authenticated]) => {
    if (!loaded) return
    if (authenticated && route.meta.public) {
      router.replace({ name: 'dashboard' })
    }
  },
  { immediate: true },
)
</script>

<template>
  <RouterView />
</template>
