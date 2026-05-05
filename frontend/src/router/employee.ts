import { createRouter, createWebHistory } from 'vue-router'

const NotFoundPage = { template: '<div class="p-6 text-gray-500">404 — Page not found</div>' }

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Employee login only — base '/employee/' + '/login' = /employee/login
    {
      path: '/login',
      name: 'employee-login',
      component: () => import('@/pages/employee/EmployeeLoginPage.vue'),
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
        { path: 'settings/security', name: 'employee-security-settings', component: () => import('@/pages/employee/SettingsPage.vue') },
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

  if (to.meta.requiresAuth !== false && !token && to.meta.role === 'employee') {
    return { name: 'employee-login' }
  }

  if (to.name === 'employee-login' && token && userRole === 'employee') {
    return { name: 'employee-dashboard' }
  }

  return true
})

export default router