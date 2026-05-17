<script setup lang="ts">
/**
 * LandingView - Vista de inicio con formulario de autenticación
 *
 * Incluye validación de email, nombre y Google login simulado.
 */
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import {
  isValidEmail,
  isValidGoogleEmail,
  isValidName,
  normalizeEmail,
} from '@/utils/authValidation'

type AuthMode = 'login' | 'register'

const auth = useAuthStore()
const router = useRouter()
const authMode = ref<AuthMode>('login')
const email = ref('demo@awita.app')
const name = ref('')
const isLoading = ref(false)
const fieldErrors = ref({ email: '', name: '', google: '' })
const formError = ref('')
const successMessage = ref('')
const googleModalOpen = ref(false)
const googleAccounts = [
  'usuario.awita@gmail.com',
  'hogar.awita@gmail.com',
  'servicios.awita@gmail.com',
]
const selectedGoogleEmail = ref(googleAccounts[0])
const customGoogleEmail = ref('')

const activeGoogleEmail = computed(() =>
  customGoogleEmail.value.trim() ? customGoogleEmail.value.trim() : selectedGoogleEmail.value,
)

const goToDashboard = async () => {
  await router.push({ name: 'dashboard' })
}

const clearErrors = () => {
  fieldErrors.value = { email: '', name: '', google: '' }
  formError.value = ''
  successMessage.value = ''
}

const setMode = (mode: AuthMode) => {
  authMode.value = mode
  clearErrors()
}

const showSuccessAndRedirect = async (message: string) => {
  successMessage.value = message
  await new Promise((resolve) => setTimeout(resolve, 800))
  await goToDashboard()
}

const validateEmailField = () => {
  const value = normalizeEmail(email.value)
  if (!value) {
    return 'Ingresa tu correo electrónico.'
  }
  if (!isValidEmail(value)) {
    return 'Ingresa un correo electrónico válido.'
  }
  return ''
}

const validateNameField = () => {
  if (authMode.value !== 'register') {
    return ''
  }
  if (!name.value.trim()) {
    return 'Ingresa tu nombre completo.'
  }
  if (!isValidName(name.value)) {
    return 'Ingresa un nombre válido.'
  }
  return ''
}

const validateGoogleField = () => {
  const value = activeGoogleEmail.value
  if (!value) {
    return 'Selecciona o ingresa un correo de Google.'
  }
  if (!isValidGoogleEmail(value)) {
    return 'Ingresa un correo de Google válido.'
  }
  return ''
}

const loginWithEmail = async () => {
  fieldErrors.value.email = validateEmailField()
  if (fieldErrors.value.email) {
    return
  }

  isLoading.value = true
  formError.value = ''
  successMessage.value = ''

  try {
    await auth.loginWithEmail(normalizeEmail(email.value))
    await showSuccessAndRedirect('Inicio de sesión exitoso. Redirigiendo...')
  } catch {
    formError.value = 'Error al iniciar sesión. Verifica tu correo.'
  } finally {
    isLoading.value = false
  }
}

const registerWithEmail = async () => {
  fieldErrors.value.email = validateEmailField()
  fieldErrors.value.name = validateNameField()
  if (fieldErrors.value.email || fieldErrors.value.name) {
    return
  }

  isLoading.value = true
  formError.value = ''
  successMessage.value = ''

  try {
    await auth.registerWithEmail(normalizeEmail(email.value), name.value.trim())
    await showSuccessAndRedirect(
      `Registro exitoso. Bienvenido${name.value.trim() ? `, ${name.value.trim()}` : ''}! Redirigiendo...`,
    )
  } catch {
    formError.value = 'Error al registrarse. Verifica tus datos e intenta de nuevo.'
  } finally {
    isLoading.value = false
  }
}

const onSubmit = async () => {
  if (authMode.value === 'login') {
    await loginWithEmail()
  } else {
    await registerWithEmail()
  }
}

const openGoogleModal = () => {
  googleModalOpen.value = true
  fieldErrors.value.google = ''
  customGoogleEmail.value = ''
  selectedGoogleEmail.value = googleAccounts[0]
}

const closeGoogleModal = () => {
  googleModalOpen.value = false
  fieldErrors.value.google = ''
  customGoogleEmail.value = ''
}

const loginWithGoogle = async () => {
  openGoogleModal()
}

const confirmGoogleSignIn = async () => {
  fieldErrors.value.google = validateGoogleField()
  if (fieldErrors.value.google) {
    return
  }

  isLoading.value = true
  formError.value = ''
  successMessage.value = ''

  try {
    await auth.loginWithGoogle(activeGoogleEmail.value)
    await showSuccessAndRedirect('Inicio de sesión con Google exitoso. Redirigiendo...')
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'Error al iniciar sesión con Google.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="landing">
    <section class="hero">
      <div class="hero__content">
        <p class="eyebrow">AWITA · Medidor inteligente para tinacos</p>
        <h1>Conoce cuánta agua tienes antes de que se acabe.</h1>
        <p class="hero__text">
          AWITA ayuda a hogares y negocios a monitorear tinacos en tiempo real, revisar
          historial de mediciones y recibir alertas cuando el nivel baja o un sensor deja
          de reportar.
        </p>
        <div class="hero__actions">
          <a class="button" href="#login">Comenzar ahora</a>
          <a class="button button--secondary" href="#beneficios">Ver beneficios</a>
        </div>
      </div>

      <div class="hero-card" aria-label="Resumen del sistema AWITA">
        <span class="hero-card__label">Tinaco principal</span>
        <strong>75%</strong>
        <div class="water-meter">
          <span style="width: 75%"></span>
        </div>
        <p>825 L disponibles · actualizado hace 7 min</p>
      </div>
    </section>

    <section id="beneficios" class="features">
      <article class="feature-card">
        <h2>Monitoreo simple</h2>
        <p>Consulta litros disponibles, porcentaje del tinaco y última lectura desde web.</p>
      </article>
      <article class="feature-card">
        <h2>Alertas pendientes</h2>
        <p>Identifica niveles bajos o sensores sin conexión antes de que causen problemas.</p>
      </article>
      <article class="feature-card">
        <h2>Historial reciente</h2>
        <p>Revisa cómo cambia el consumo y detecta patrones de uso en tus tinacos.</p>
      </article>
    </section>

    <section id="login" class="login-card">
      <div>
        <p class="eyebrow">Acceso</p>
        <h2>Inicia sesión o crea tu cuenta</h2>
        <p>Registra tus datos en el frontend, luego usa tu cuenta para acceder.</p>
      </div>

      <form class="login-form" @submit.prevent="onSubmit">
        <div class="auth-toggle">
          <button
            type="button"
            class="button button--ghost auth-toggle__button"
            :class="{ 'auth-toggle__button--active': authMode === 'login' }"
            @click="setMode('login')"
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            class="button button--ghost auth-toggle__button"
            :class="{ 'auth-toggle__button--active': authMode === 'register' }"
            @click="setMode('register')"
          >
            Registrarse
          </button>
        </div>

        <label for="email">Correo electrónico</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="tu@correo.com"
          :class="{ 'input--error': fieldErrors.email }"
        />
        <p v-if="fieldErrors.email" class="error-message">{{ fieldErrors.email }}</p>

        <div v-if="authMode === 'register'">
          <label for="name">Nombre completo</label>
          <input
            id="name"
            v-model="name"
            type="text"
            placeholder="Juan Pérez"
            :class="{ 'input--error': fieldErrors.name }"
          />
          <p v-if="fieldErrors.name" class="error-message">{{ fieldErrors.name }}</p>
        </div>

        <p v-if="formError" class="error-message">{{ formError }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

        <div class="login-form__actions">
          <button class="button" type="submit" :disabled="isLoading">
            <span v-if="isLoading" class="loading-spinner"></span>
            {{ authMode === 'login' ? 'Iniciar sesión' : 'Registrarme' }}
          </button>
          <button
            v-if="authMode === 'register'"
            class="button button--secondary"
            type="button"
            @click="setMode('login')"
          >
            Ir a iniciar sesión
          </button>
        </div>

        <button class="button button--google" type="button" @click="loginWithGoogle" :disabled="isLoading">
          <span v-if="isLoading" class="loading-spinner"></span>
          Continuar con Google
        </button>

        <p class="field-hint">
          {{ authMode === 'login'
            ? 'Ingresa tu correo y presiona Iniciar sesión.'
            : 'Ingresa tu correo y nombre para crear una cuenta.' }}
        </p>
      </form>
    </section>

    <div v-if="googleModalOpen" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="google-signin-title">
      <div class="modal-card modal-card--wide">
        <div class="modal-card__header">
          <div>
            <h2 id="google-signin-title">Iniciar sesión con Google</h2>
            <p>Elige una cuenta o ingresa un correo @gmail.com válido.</p>
          </div>
          <button class="modal-close" type="button" @click="closeGoogleModal" aria-label="Cerrar">×</button>
        </div>

        <div class="modal-form">
          <div class="google-account-list">
            <label v-for="account in googleAccounts" :key="account" class="google-account-option">
              <input
                type="radio"
                name="googleAccount"
                :value="account"
                v-model="selectedGoogleEmail"
              />
              <span>{{ account }}</span>
            </label>
          </div>

          <div class="custom-google-field">
            <label for="customGoogleEmail">Otro correo de Google</label>
            <input
              id="customGoogleEmail"
              type="email"
              v-model="customGoogleEmail"
              placeholder="usuario@gmail.com"
            />
            <span class="field-hint">
              Solo correos con dominio <strong>@gmail.com</strong>.
            </span>
          </div>

          <p v-if="fieldErrors.google" class="error-message">{{ fieldErrors.google }}</p>

          <div class="form-actions">
            <button class="button" type="button" @click="confirmGoogleSignIn" :disabled="isLoading">
              <span v-if="isLoading" class="loading-spinner"></span>
              Continuar con Google
            </button>
            <button class="button button--secondary" type="button" @click="closeGoogleModal">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

