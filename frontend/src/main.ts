import 'leaflet/dist/leaflet.css'
import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useTheme } from './composables/useTheme'
import type { Router } from 'vue-router'

export function createAppInstance(router: Router) {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  useTheme().init()

  return app
}