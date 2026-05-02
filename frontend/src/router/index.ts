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
    {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/RegisterPage.vue'),
      meta: { requiresAuth: false },
    },
    // Employee routes
    {
      path: '/',
      component: () => import('@/layouts/EmployeeLayout.vue'),
      meta: { requiresAuth: true, role: 'employee' },
      children: [
        {
          path: '',
          name: 'employee-dashboard',
          component: () => import('@/pages/employee/DashboardPage.vue'),
        },
        {
          path: 'clock',
          name: 'clock',
          component: () => import('@/pages/employee/ClockPage.vue'),
        },
        {
          path: 'history',
          name: 'history',
          component: () => import('@/pages/employee/HistoryPage.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/pages/employee/ProfilePage.vue'),
        },
      ],
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

  // Protect employee routes — redirect to employee login if not authenticated
  if ((to.path === '/' || !to.path.startsWith('/admin')) && to.meta.requiresAuth && !token) {
    return { name: 'employee-login' }
  }

  // Role guard — redirect if user goes to wrong portal
  if (to.meta.role && userRole !== to.meta.role) {
    return { name: userRole === 'admin' ? 'admin-dashboard' : 'employee-dashboard' }
  }

  // Redirect logged-in users away from login pages
  if (to.name === 'employee-login' && token && userRole !== 'admin') {
    return { name: 'employee-dashboard' }
  }
  if (to.name === 'admin-login' && token && userRole === 'admin') {
    return { name: 'admin-dashboard' }
  }

  return true
})

export default router
