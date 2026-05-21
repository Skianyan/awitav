<script setup lang="ts">
import { SignInButton, SignUpButton } from '@clerk/vue'

const githubUrl = 'https://github.com/Skianyan/awitav'

const benefits = [
  {
    title: 'Monitoreo en tiempo real',
    description: 'Consulta el nivel y los litros disponibles de cada tinaco desde cualquier dispositivo.',
  },
  {
    title: 'Alertas inteligentes',
    description: 'Recibe avisos cuando el agua baja o un sensor deja de reportar mediciones.',
  },
  {
    title: 'Historial de consumo',
    description: 'Revisa lecturas recientes y detecta patrones de uso en tus tanques.',
  },
  {
    title: 'Configuración por tinaco',
    description: 'Ajusta capacidad, altura y umbrales de alerta según cada instalación.',
  },
]

const scrollToDemo = () => {
  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="landing-page">
    <header class="landing-header">
      <span class="awita-logo landing-header__brand">AWITA</span>
      <SignInButton mode="modal">
        <button class="button button--small" type="button">Iniciar sesión</button>
      </SignInButton>
    </header>

    <section class="landing-hero">
      <h1 class="awita-logo landing-hero__title">AWITA</h1>
      <p class="landing-hero__subtitle">
        Monitorea el nivel y consumo de agua de tus tanques en tiempo real
      </p>
      <div class="landing-hero__actions">
        <SignUpButton mode="modal">
          <button class="button" type="button">Comprar ahora</button>
        </SignUpButton>
        <button class="button button--secondary" type="button" @click="scrollToDemo">
          Ver demo
        </button>
      </div>
    </section>

    <div class="landing-tide" aria-hidden="true">
      <div class="landing-tide__layer landing-tide__layer--deep">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none">
          <path
            d="M0,26 C240,44 480,12 720,26 C960,40 1200,14 1440,26 L1440,48 L0,48 Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div class="landing-tide__layer landing-tide__layer--mid">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none">
          <path
            d="M0,30 C300,14 600,38 900,28 C1140,20 1320,34 1440,30 L1440,48 L0,48 Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div class="landing-tide__layer landing-tide__layer--surface">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none">
          <path
            d="M0,34 C360,48 720,22 1080,34 C1260,42 1380,30 1440,34 L1440,48 L0,48 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>

    <section id="demo" class="landing-split">
      <div class="landing-benefits">
        <p class="eyebrow">Beneficios</p>
        <h2>Todo lo que necesitas para cuidar tu agua</h2>
        <ul class="landing-benefits__list">
          <li v-for="benefit in benefits" :key="benefit.title" class="landing-benefits__item">
            <h3>{{ benefit.title }}</h3>
            <p>{{ benefit.description }}</p>
          </li>
        </ul>
      </div>

      <div class="landing-preview" aria-label="Vista previa del panel de control AWITA">
        <div class="landing-preview__chrome">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div class="landing-preview__body">
          <aside class="landing-preview__sidebar">
            <div class="landing-preview__brand">AWITA</div>
            <div class="landing-preview__nav-item landing-preview__nav-item--active"></div>
            <div class="landing-preview__nav-item"></div>
            <div class="landing-preview__nav-item"></div>
          </aside>
          <div class="landing-preview__main">
            <div class="landing-preview__stats">
              <div class="landing-preview__stat">
                <span>Nivel</span>
                <strong>75%</strong>
              </div>
              <div class="landing-preview__stat">
                <span>Disponible</span>
                <strong>825 L</strong>
              </div>
              <div class="landing-preview__stat">
                <span>Estado</span>
                <strong>En línea</strong>
              </div>
            </div>
            <div class="landing-preview__gauge">
              <div class="landing-preview__gauge-bar">
                <span style="width: 75%"></span>
              </div>
              <p>Tinaco principal · actualizado hace 7 min</p>
            </div>
            <div class="landing-preview__chart">
              <div
                v-for="n in 6"
                :key="n"
                class="landing-preview__bar"
                :style="{ height: `${30 + n * 10}%` }"
              />
            </div>
          </div>
        </div>
        <p class="landing-preview__caption">Vista previa del dashboard</p>
      </div>
    </section>

    <footer class="landing-footer">
      <span>AWITA 2026</span>
      <a
        class="landing-footer__github"
        :href="githubUrl"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Repositorio en GitHub"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.262.825-.585 0-.292-.015-1.26-.015-2.28-3.337.727-4.035-1.605-4.035-1.605-.546-1.387-1.335-1.755-1.335-1.755-1.09-.745.083-.73.083-.73 1.205.09 1.84 1.237 1.84 1.237 1.07 1.835 2.805 1.305 3.495.997.105-.775.42-1.305.765-1.605-2.67-.3-5.475-1.335-5.475-5.925 0-1.305.465-2.37 1.23-3.21-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.21 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.585A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"
          />
        </svg>
      </a>
    </footer>
  </div>
</template>
