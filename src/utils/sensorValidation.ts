/**
 * Utilidades de validación para sensores
 *
 * Proporciona funciones para validar IDs de sensores y configuraciones,
 * asegurando que los datos cumplan con los límites y reglas del sistema.
 */
import type { SensorSettingsInput } from '@/types'
import {
  MAX_CAPACITY_LITERS,
  MAX_MEASUREMENT_INTERVAL_MINUTES,
  MAX_TANK_HEIGHT_CM,
  MAX_WATER_DISTANCE_CM,
  SENSOR_ID_LENGTH,
} from '@/constants/sensorLimits'

const idPattern = new RegExp(`^[A-Z0-9]{${SENSOR_ID_LENGTH}}$`)

/**
 * Valida el formato del ID del sensor
 *
 * El ID debe:
 * - Tener exactamente SENSOR_ID_LENGTH caracteres
 * - Contener solo letras mayúsculas y números
 *
 * @param {string} id - ID del sensor a validar
 * @throws {Error} Si el ID no cumple con el formato requerido
 * @example
 * assertValidSensorId('ABC123') // OK
 * assertValidSensorId('abc123') // Lanza error
 */
export function assertValidSensorId(id: string): void {
  const normalized = id.trim().toUpperCase()

  if (!idPattern.test(normalized)) {
    throw new Error(`El ID debe tener exactamente ${SENSOR_ID_LENGTH} caracteres alfanuméricos.`)
  }
}

/**
 * Valida la configuración completa de un sensor
 *
 * Valida que todos los parámetros estén dentro de los rangos permitidos:
 * - Capacidad: 1 a MAX_CAPACITY_LITERS litros
 * - Altura del tinaco: 1 a MAX_TANK_HEIGHT_CM cm
 * - Distancia al agua: 0 a MAX_WATER_DISTANCE_CM cm
 * - Distancia al agua no puede ser mayor que altura
 * - Intervalo de medición: 1 a MAX_MEASUREMENT_INTERVAL_MINUTES minutos
 *
 * @param {SensorSettingsInput} input - Configuración del sensor a validar
 * @throws {Error} Si algún parámetro no cumple con los requisitos
 * @example
 * assertValidSensorSettings({
 *   maxCapacityLiters: 1100,
 *   tankHeightCm: 120,
 *   waterDistanceCm: 60,
 *   measurementIntervalMinutes: 15
 * })
 */
export function assertValidSensorSettings(input: SensorSettingsInput): void {
  const capacity = Number(input.maxCapacityLiters)
  const height = Number(input.tankHeightCm)
  const distance = Number(input.waterDistanceCm)
  const interval = Number(input.measurementIntervalMinutes)

  if (!Number.isFinite(capacity) || capacity < 1 || capacity > MAX_CAPACITY_LITERS) {
    throw new Error(`La capacidad debe estar entre 1 y ${MAX_CAPACITY_LITERS.toLocaleString('es-MX')} L.`)
  }

  if (!Number.isFinite(height) || height < 1 || height > MAX_TANK_HEIGHT_CM) {
    throw new Error(`La altura debe estar entre 1 y ${MAX_TANK_HEIGHT_CM.toLocaleString('es-MX')} cm.`)
  }

  if (!Number.isFinite(distance) || distance < 0 || distance > MAX_WATER_DISTANCE_CM) {
    throw new Error(`La distancia al agua debe estar entre 0 y ${MAX_WATER_DISTANCE_CM.toLocaleString('es-MX')} cm.`)
  }

  if (distance > height) {
    throw new Error('La distancia al agua no puede ser mayor que la altura del tinaco.')
  }

  if (!Number.isFinite(interval) || interval < 1 || interval > MAX_MEASUREMENT_INTERVAL_MINUTES) {
    throw new Error(
      `El intervalo de medición debe estar entre 1 minuto y ${MAX_MEASUREMENT_INTERVAL_MINUTES} minutos (24 horas).`,
    )
  }
}
