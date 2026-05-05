import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { useAuthStore } from '@/store/auth'

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
})

function handleUnauthorized(): void {
  const authStore = useAuthStore()
  const currentPath = window.location.pathname
  authStore.setRedirectPath(currentPath)
  window.location.href = authStore.loginPath
}

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/auth/refresh`,
            { refresh_token: refreshToken }
          )

          const { token, refresh_token } = response.data.data
          localStorage.setItem('auth_token', token)
          localStorage.setItem('refresh_token', refresh_token)

          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
          handleUnauthorized()
          return Promise.reject(refreshError)
        }
      }

      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      handleUnauthorized()
    }

    return Promise.reject(error)
  }
)

export default apiClient