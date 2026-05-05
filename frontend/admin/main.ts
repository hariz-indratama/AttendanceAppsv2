import { createAppInstance } from '../src/main'
import adminRouter from '../src/router/admin'

const app = createAppInstance(adminRouter)
app.mount('#app')