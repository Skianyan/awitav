<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { useSensorsStore } from '@/stores/sensors'

const auth = useAuthStore()
const sensorsStore = useSensorsStore()
const router = useRouter()
const isUserMenuOpen = ref(false)
const isAccountModalOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

const primaryNavigation = [
  { label: 'Panel de control', routeName: 'dashboard', icon: '📈' },
  { label: 'Sensores', routeName: 'sensors', icon: '📳' },
]

const notificationNavigation = {
  label: 'Notificaciones',
  routeName: 'notifications',
  icon: '🔔',
}

const displayName = computed(() => {
  const email = auth.user?.email ?? ''
  if (!email) {
    return 'Usuario'
  }

  return email.split('@')[0]
})

const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

const closeAccountModal = () => {
  isAccountModalOpen.value = false
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const openAccount = () => {
  closeUserMenu()
  isAccountModalOpen.value = true
}

const logout = async () => {
  closeUserMenu()
  auth.logout()
  await router.push({ name: 'landing' })
}

const handleClickOutside = (event: MouseEvent) => {
  if (!userMenuRef.value) {
    return
  }

  const target = event.target
  if (target instanceof Node && !userMenuRef.value.contains(target)) {
    closeUserMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <aside class="sidebar">
    <div>
      <RouterLink class="brand" :to="{ name: 'dashboard' }">
        <span>
          <strong>AWITA</strong>
        </span>
      </RouterLink>

      <nav class="sidebar__nav sidebar__nav--primary" aria-label="Navegación principal">
        <RouterLink
          v-for="item in primaryNavigation"
          :key="item.routeName"
          class="sidebar__link"
          :to="{ name: item.routeName }"
        >
          <span class="sidebar__link-main">
            <span class="sidebar__link-icon" aria-hidden="true">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </span>
        </RouterLink>
      </nav>

      <nav class="sidebar__nav sidebar__nav--secondary" aria-label="Notificaciones">
        <RouterLink class="sidebar__link" :to="{ name: notificationNavigation.routeName }">
          <span class="sidebar__link-main">
            <span class="sidebar__link-icon" aria-hidden="true">{{ notificationNavigation.icon }}</span>
            <span>{{ notificationNavigation.label }}</span>
          </span>
          <span class="badge">
            {{ sensorsStore.pendingNotifications.length }}
          </span>
        </RouterLink>
      </nav>
    </div>

    <div ref="userMenuRef" class="sidebar__user">
      <button
        class="sidebar__user-trigger"
        type="button"
        aria-haspopup="menu"
        :aria-expanded="isUserMenuOpen"
        @click="toggleUserMenu"
      >
        <span class="sidebar__user-icon" aria-hidden="true">&#128100;</span>
        <span class="sidebar__user-meta">
          <strong>{{ displayName }}</strong>
          <span>{{ auth.user?.email }}</span>
        </span>
        <span class="sidebar__user-ellipsis" aria-hidden="true">&#8942;</span>
      </button>

      <div v-if="isUserMenuOpen" class="sidebar__user-menu" role="menu">
        <button class="sidebar__user-menu-item" type="button" role="menuitem" @click="openAccount">Cuenta</button>
        <button class="sidebar__user-menu-item" type="button" role="menuitem" @click="logout">Cerrar sesión</button>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="isAccountModalOpen" class="modal-backdrop" role="presentation" @click.self="closeAccountModal">
        <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="account-title">
          <div class="modal-card__header">
            <div>
              <p class="eyebrow">Cuenta</p>
              <h2 id="account-title">Informacion del usuario</h2>
            </div>
            <button class="modal-close" type="button" aria-label="Cerrar" @click="closeAccountModal">×</button>
          </div>

          <dl class="account-info">
            <div>
              <dt>Nombre</dt>
              <dd>{{ displayName }}</dd>
            </div>
            <div>
              <dt>Correo</dt>
              <dd>{{ auth.user?.email }}</dd>
            </div>
            <div>
              <dt>Proveedor</dt>
              <dd>{{ auth.user?.provider }}</dd>
            </div>
            <div>
              <dt>ID</dt>
              <dd>{{ auth.user?.id }}</dd>
            </div>
          </dl>

          <div class="form-actions">
            <button class="button button--secondary" type="button" @click="closeAccountModal">Cerrar</button>
          </div>
        </section>
      </div>
    </Teleport>
  </aside>
</template>
