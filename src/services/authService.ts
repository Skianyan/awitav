import { isValidGoogleEmail, normalizeEmail } from '@/utils/authValidation'
/**
 * authService
 *
 * Servicio que simula autenticación del usuario en el frontend.
 * Usa localStorage para persistir la sesión de usuario.
 *
 * Métodos:
 * - getCurrentUser: lee la sesión actual del navegador
 * - loginWithEmail: simula inicio de sesión por correo
 * - registerWithEmail: simula registro por correo
 * - loginWithGoogle: simula inicio de sesión con Google
 * - updateUserName: actualiza el nombre del usuario en sesión
 * - logout: elimina la sesión
 */
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

  async registerWithEmail(email: string, name?: string): Promise<User> {
    // Simula demora de red
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const user = createUser(email, 'email', name)
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
  },

  async loginWithGoogle(email?: string): Promise<User> {
    // Simula demora de redirección OAuth
    await new Promise((resolve) => setTimeout(resolve, 1200))
    const normalizedEmail = email?.trim() ? normalizeEmail(email) : 'usuario.google@awita.app'

    if (email && !isValidGoogleEmail(normalizedEmail)) {
      throw new Error('Ingresa un correo de Google válido.')
    }

    const user = createUser(normalizedEmail, 'google')
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
