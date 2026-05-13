<script setup lang="ts">
/**
 * LandingView - Vista de inicio con formulario de autenticación
 *
 * Incluye validación en tiempo real de email, mensajes de error,
 * feedback de carga y protección contra envíos inválidos.
 */
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const email = ref('demo@awita.app')
const isLoading = ref(false)
const errorMessage = ref('')

// Validación de email con regex estándar
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isValidEmail = computed(() => emailRegex.test(email.value))

/**
 * Navega al dashboard
 */
const goToDashboard = async () => {
  await router.push({ name: 'dashboard' })
}

/**
 * Inicia sesión con email
 */
const loginWithEmail = async () => {
  if (!isValidEmail.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    await auth.loginWithEmail(email.value)
    await goToDashboard()
  } catch (error) {
    errorMessage.value = 'Error al iniciar sesión. Verifica tu correo.'
  } finally {
    isLoading.value = false
  }
}

/**
 * Registra con email
 */
const registerWithEmail = async () => {
  if (!isValidEmail.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    await auth.registerWithEmail(email.value)
    await goToDashboard()
  } catch (error) {
    errorMessage.value = 'Error al registrarse. Verifica tu correo.'
  } finally {
    isLoading.value = false
  }
}

/**
 * Inicia sesión con Google
 */
const loginWithGoogle = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    await auth.loginWithGoogle()
    await goToDashboard()
  } catch (error) {
    errorMessage.value = 'Error al iniciar sesión con Google.'
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
        <p>Esta versión usa autenticación simulada para avanzar con el frontend.</p>
      </div>

      <form class="login-form" @submit.prevent="loginWithEmail">
        <label for="email">Correo electrónico</label>
        <input id="email" v-model="email" type="email" required placeholder="tu@correo.com" :class="{ 'input--error': email && !isValidEmail }" />
        <p v-if="email && !isValidEmail" class="error-message">Ingresa un correo electrónico válido.</p>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <div class="login-form__actions">
          <button class="button" type="submit" :disabled="!isValidEmail || isLoading">
            <span v-if="isLoading" class="loading-spinner"></span>
            Iniciar sesión
          </button>
          <button class="button button--secondary" type="button" @click="registerWithEmail" :disabled="!isValidEmail || isLoading">
            <span v-if="isLoading" class="loading-spinner"></span>
            Registrarme
          </button>
        </div>
        <button class="button button--google" type="button" @click="loginWithGoogle" :disabled="isLoading">
          <span v-if="isLoading" class="loading-spinner"></span>
          Continuar con Google
        </button>
      </form>
    </section>
  </main>
</template>

<style scoped>
.input--error {
  border-color: #ff4444;
}

.error-message {
  color: #ff4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.loading-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
