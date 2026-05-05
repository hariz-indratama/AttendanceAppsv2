import 'leaflet/dist/leaflet.css'
import '../src/assets/base.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '../src/App.vue'
import employeeRouter from '../src/router/employee'
import { useTheme } from '../src/composables/useTheme'

const app = createApp(App)

app.use(createPinia())
app.use(employeeRouter)

useTheme().init()

app.mount('#app')