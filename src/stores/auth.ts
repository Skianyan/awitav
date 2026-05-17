import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { authService } from '@/services/authService'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(authService.getCurrentUser())

  const isAuthenticated = computed(() => Boolean(user.value))

  function loginWithEmail(email: string) {
    return authService.loginWithEmail(email).then((newUser) => {
      user.value = newUser
      return newUser
    })
  }

  function registerWithEmail(email: string) {
    return authService.registerWithEmail(email).then((newUser) => {
      user.value = newUser
      return newUser
    })
  }

  function loginWithGoogle() {
    return authService.loginWithGoogle().then((newUser) => {
      user.value = newUser
      return newUser
    })
  }

  function updateProfile(name: string) {
    if (!user.value) {
      throw new Error('Usuario no autenticado')
    }
    user.value = authService.updateUserName(name)
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
    updateProfile,
    logout,
  }
})
