import { createRouter, createWebHistory } from 'vue-router'

const NotFoundPage = { template: '<div class="p-6 text-gray-500">404 — Page not found</div>' }

const router = createRouter({
  history: createWebHistory('/admin'),
  routes: [
    // Auth routes (non-base: served from root at /login)
    {
      path: '/login',
      name: 'employee-login',
      component: () => import('@/pages/employee/EmployeeLoginPage.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/admin-login',
      name: 'admin-login',
      component: () => import('@/pages/admin/AdminLoginPage.vue'),
      meta: { requiresAuth: false },
    },
    // Admin routes (base: /admin/ → served at /admin/...)
    {
      path: '/',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        { path: '', name: 'admin-dashboard', component: () => import('@/pages/admin/DashboardPage.vue') },
        { path: 'employees', name: 'employees', component: () => import('@/pages/admin/EmployeesPage.vue') },
        { path: 'attendance', name: 'admin-attendance', component: () => import('@/pages/admin/AttendancePage.vue') },
        { path: 'payroll', name: 'payroll', component: () => import('@/pages/admin/PayrollPage.vue') },
        { path: 'reports', name: 'reports', component: () => import('@/pages/admin/ReportsPage.vue') },
        { path: 'settings', name: 'admin-settings', component: () => import('@/pages/admin/SettingsPage.vue') },
      ],
    },
    // Catch-all 404
    {
      path: '/:pathMatch(.*)*',
      name: 'admin-not-found',
      component: NotFoundPage,
      meta: { requiresAuth: false },
    },
  ],
})

router.beforeEach((to, _from) => {
  const token = localStorage.getItem('auth_token')
  const userRole = localStorage.getItem('user_role')

  // Redirect logged-in admins away from login page
  if (to.name === 'admin-login' && token && userRole === 'admin') {
    return { name: 'admin-dashboard' }
  }

  // Protect admin routes
  if (to.meta.role === 'admin' && !token) {
    return { name: 'admin-login' }
  }

  // Redirect logged-in employees away from login page
  if (to.name === 'employee-login' && token && userRole === 'employee') {
    return { name: 'employee-dashboard' }
  }

  // Protect employee routes
  if (to.path.startsWith('/employee') && to.meta.role === 'employee' && !token) {
    return { name: 'employee-login' }
  }

  return true
})

export default router