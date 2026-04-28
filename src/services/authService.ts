import type { AuthProvider, User } from '@/types'

const SESSION_KEY = 'awita_session'

const createUser = (email: string, provider: AuthProvider): User => ({
  id: `${provider}-${email.toLowerCase()}`,
  email: email.toLowerCase(),
  provider,
})

export const authService = {
  getCurrentUser(): User | null {
    const storedSession = localStorage.getItem(SESSION_KEY)

    if (!storedSession) {
      return null
    }

    try {
      return JSON.parse(storedSession) as User
    } catch {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
  },

  loginWithEmail(email: string): User {
    const user = createUser(email, 'email')
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
  },

  registerWithEmail(email: string): User {
    const user = createUser(email, 'email')
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
  },

  loginWithGoogle(): User {
    const user = createUser('usuario.google@awita.app', 'google')
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
  },

  logout(): void {
    localStorage.removeItem(SESSION_KEY)
  },
}
