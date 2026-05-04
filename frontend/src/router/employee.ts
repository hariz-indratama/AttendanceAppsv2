import { createRouter, createWebHistory } from 'vue-router'

const NotFoundPage = { template: '<div class="p-6 text-gray-500">404 — Page not found</div>' }

const router = createRouter({
  history: createWebHistory('/employee'),
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
    // Employee routes (base: /employee/ → served at /employee/...)
    {
      path: '/',
      component: () => import('@/layouts/EmployeeLayout.vue'),
      meta: { requiresAuth: true, role: 'employee' },
      children: [
        { path: '', name: 'employee-dashboard', component: () => import('@/pages/employee/DashboardPage.vue') },
        { path: 'clock', name: 'employee-clock', component: () => import('@/pages/employee/ClockPage.vue') },
        { path: 'history', name: 'employee-history', component: () => import('@/pages/employee/HistoryPage.vue') },
        { path: 'profile', name: 'employee-profile', component: () => import('@/pages/employee/ProfilePage.vue') },
        { path: 'settings', name: 'employee-settings', component: () => import('@/pages/employee/SettingsPage.vue') },
        { path: 'settings/display', name: 'employee-display-settings', component: () => import('@/pages/employee/DisplaySettings.vue') },
        { path: 'settings/notifications', name: 'employee-notif-settings', component: () => import('@/pages/employee/NotificationSettings.vue') },
        { path: 'settings/security', name: 'employee-security-settings', component: () => import('@/pages/employee/SecuritySettings.vue') },
      ],
    },
    // Admin routes (non-base: served from root at /admin/...)
    {
      path: '/admin',
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
      name: 'employee-not-found',
      component: NotFoundPage,
      meta: { requiresAuth: false },
    },
  ],
})

router.beforeEach((to, _from) => {
  const token = localStorage.getItem('auth_token')
  const userRole = localStorage.getItem('user_role')

  // Redirect logged-in employees away from login page
  if (to.name === 'employee-login' && token && userRole === 'employee') {
    return { name: 'employee-dashboard' }
  }

  // Protect employee routes
  if (to.meta.role === 'employee' && !token) {
    return { name: 'employee-login' }
  }

  // Redirect logged-in admins away from login page
  if (to.name === 'admin-login' && token && userRole === 'admin') {
    return { name: 'admin-dashboard' }
  }

  // Protect admin routes
  if (to.path.startsWith('/admin') && to.meta.role === 'admin' && !token) {
    return { name: 'admin-login' }
  }

  return true
})

export default router