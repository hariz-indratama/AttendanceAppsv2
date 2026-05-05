import 'leaflet/dist/leaflet.css'
import './assets/base.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import adminRouter from './router/admin'
import employeeRouter from './router/employee'
import { useTheme } from './composables/useTheme'

const context = (import.meta as any).env?.__APP_CONTEXT__ ?? 'employee'
const router = context === 'admin' ? adminRouter : employeeRouter

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Init theme before mount to avoid flash
useTheme().init()

app.mount('#app')