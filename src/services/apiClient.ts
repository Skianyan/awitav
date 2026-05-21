import { env } from '@/config/env'
import { useAuthStore } from '@/stores/auth'

type ApiErrorBody = {
  message?: string | string[]
  error?: string
  statusCode?: number
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody
    if (Array.isArray(body.message)) {
      return body.message.join(', ')
    }
    if (body.message) {
      return body.message
    }
  } catch {
    // ignore JSON parse errors
  }

  return response.statusText || `Error ${response.status}`
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!env.apiBaseUrl) {
    throw new Error('VITE_API_BASE_URL no está configurada en el archivo .env')
  }

  const auth = useAuthStore()
  const token = await auth.getSessionToken()

  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const message = await parseErrorMessage(response)
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
