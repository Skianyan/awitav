import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { authService } from '@/services/authService'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(authService.getCurrentUser())

  const isAuthenticated = computed(() => Boolean(user.value))

  function loginWithEmail(email: string) {
    user.value = authService.loginWithEmail(email)
  }

  function registerWithEmail(email: string) {
    user.value = authService.registerWithEmail(email)
  }

  function loginWithGoogle() {
    user.value = authService.loginWithGoogle()
  }

  function logout() {
    authService.logout()
    user.value = null
  }

  return {
    user,
    isAuthenticated,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
  }
})
