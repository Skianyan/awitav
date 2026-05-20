import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { clerkPlugin } from '@clerk/vue'

import App from './App.vue'
import router from './router'
import './assets/main.css'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!publishableKey) {
  throw new Error('Agrega VITE_CLERK_PUBLISHABLE_KEY en el archivo .env')
}

const app = createApp(App)

app.use(clerkPlugin, {
  publishableKey,
  signInForceRedirectUrl: '/dashboard',
  signUpForceRedirectUrl: '/dashboard',
})
app.use(createPinia())
app.use(router)

app.mount('#app')
