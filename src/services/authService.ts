import type { AuthProvider, User } from '@/types'

const SESSION_KEY = 'awita_session'

const createUser = (email: string, provider: AuthProvider, name?: string): User => ({
  id: `${provider}-${email.toLowerCase()}`,
  name: name ?? email.split('@')[0],
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

  async loginWithEmail(email: string): Promise<User> {
    // Simula demora de red
    await new Promise((resolve) => setTimeout(resolve, 800))
    const user = createUser(email, 'email')
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
  },

  async registerWithEmail(email: string): Promise<User> {
    // Simula demora de red
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const user = createUser(email, 'email')
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
  },

  async loginWithGoogle(): Promise<User> {
    // Simula demora de redirección OAuth
    await new Promise((resolve) => setTimeout(resolve, 1200))
    const user = createUser('usuario.google@awita.app', 'google', 'Usuario Google')
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
  },

  updateUserName(name: string): User {
    const currentUser = this.getCurrentUser()
    if (!currentUser) {
      throw new Error('Usuario no autenticado')
    }

    const updatedUser: User = {
      ...currentUser,
      name,
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser))
    return updatedUser
  },

  logout(): void {
    localStorage.removeItem(SESSION_KEY)
  },
}
