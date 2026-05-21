/**
 * Fachada del servicio de sensores.
 * Usa datos mock o el API de awita-back según VITE_USE_MOCK.
 */
import { env } from '@/config/env'
import { sensorApi } from '@/services/sensorApi'
import { sensorServiceMock } from '@/services/sensorService.mock'

export const sensorService = env.useMock ? sensorServiceMock : sensorApi
