import { createAppInstance } from '../src/main'
import employeeRouter from '../src/router/employee'

const app = createAppInstance(employeeRouter)
app.mount('#app')