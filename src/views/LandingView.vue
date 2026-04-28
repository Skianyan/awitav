<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const email = ref('demo@awita.app')

const goToDashboard = async () => {
  await router.push({ name: 'dashboard' })
}

const loginWithEmail = async () => {
  auth.loginWithEmail(email.value)
  await goToDashboard()
}

const registerWithEmail = async () => {
  auth.registerWithEmail(email.value)
  await goToDashboard()
}

const loginWithGoogle = async () => {
  auth.loginWithGoogle()
  await goToDashboard()
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
        <input id="email" v-model="email" type="email" required placeholder="tu@correo.com" />
        <div class="login-form__actions">
          <button class="button" type="submit">Iniciar sesión</button>
          <button class="button button--secondary" type="button" @click="registerWithEmail">
            Registrarme
          </button>
        </div>
        <button class="button button--google" type="button" @click="loginWithGoogle">
          Continuar con Google
        </button>
      </form>
    </section>
  </main>
</template>
