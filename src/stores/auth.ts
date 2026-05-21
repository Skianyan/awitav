import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useAuth, useUser } from '@clerk/vue'
import type { UserResource } from '@clerk/shared/types'

import type { AuthProvider, User } from '@/types'

function resolveProvider(clerkUser: UserResource): AuthProvider {
  const usesGoogle = clerkUser.externalAccounts.some(
    (account: { provider: string }) => account.provider === 'google',
  )
  return usesGoogle ? 'google' : 'email'
}

function mapClerkUser(clerkUser: UserResource): User {
  const email = clerkUser.primaryEmailAddress?.emailAddress ?? ''

  return {
    id: clerkUser.id,
    name:
      clerkUser.fullName ??
      clerkUser.firstName ??
      email.split('@')[0] ??
      'Usuario',
    email,
    provider: resolveProvider(clerkUser),
  }
}

export const useAuthStore = defineStore('auth', () => {
  const { isLoaded, isSignedIn, signOut, getToken } = useAuth()
  const { user: clerkUser } = useUser()

  const user = computed<User | null>(() => {
    if (!clerkUser.value) {
      return null
    }

    return mapClerkUser(clerkUser.value)
  })

  const isAuthenticated = computed(() => Boolean(isSignedIn.value))
  const isClerkLoaded = computed(() => Boolean(isLoaded.value))

  async function logout() {
    await signOut.value()
  }

  async function getSessionToken() {
    return getToken.value()
  }

  return {
    user,
    isAuthenticated,
    isClerkLoaded,
    logout,
    getSessionToken,
  }
})
