import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Auth routes
    {
      path: '/login',
      name: 'employee-login',
      component: () => import('@/pages/employee/EmployeeLoginPage.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('@/pages/admin/AdminLoginPage.vue'),
      meta: { requiresAuth: false },
    },
    // Admin routes
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/pages/admin/DashboardPage.vue'),
        },
        {
          path: 'employees',
          name: 'employees',
          component: () => import('@/pages/admin/EmployeesPage.vue'),
        },
        {
          path: 'attendance',
          name: 'admin-attendance',
          component: () => import('@/pages/admin/AttendancePage.vue'),
        },
        {
          path: 'payroll',
          name: 'payroll',
          component: () => import('@/pages/admin/PayrollPage.vue'),
        },
        {
          path: 'reports',
          name: 'reports',
          component: () => import('@/pages/admin/ReportsPage.vue'),
        },
        {
          path: 'settings',
          name: 'admin-settings',
          component: () => import('@/pages/admin/SettingsPage.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, _from) => {
  const token = localStorage.getItem('auth_token')
  const userRole = localStorage.getItem('user_role')

  // Protect admin routes — redirect to admin login if not authenticated
  if (to.path.startsWith('/admin') && to.meta.role === 'admin' && !token) {
    return { name: 'admin-login' }
  }

  // Redirect logged-in users away from login pages
  if (to.name === 'admin-login' && token && userRole === 'admin') {
    return { name: 'admin-dashboard' }
  }

  return true
})

export default router
