import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import DashboardView from '@/views/DashboardView.vue'
import LandingView from '@/views/LandingView.vue'
import NotificationsView from '@/views/NotificationsView.vue'
import SensorDetailView from '@/views/SensorDetailView.vue'
import SensorsView from '@/views/SensorsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView,
      meta: { public: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/sensores',
      name: 'sensors',
      component: SensorsView,
    },
    {
      path: '/sensor/:id',
      name: 'sensor-detail',
      component: SensorDetailView,
    },
    {
      path: '/notificaciones',
      name: 'notifications',
      component: NotificationsView,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (!auth.isClerkLoaded) {
    return true
  }

  if (!to.meta.public && !auth.isAuthenticated) {
    return { name: 'landing' }
  }

  if (to.name === 'landing' && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
