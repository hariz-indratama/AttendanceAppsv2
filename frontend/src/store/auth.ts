import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types/auth'
import apiClient from '@/api/axios'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loginPath: string
  redirectPath: string
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const isAuthenticated = ref<boolean>(!!token.value)
  const loginPath = ref<string>('/login')
  const redirectPath = ref<string>('')

  async function login(credentials: LoginCredentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials)
      const { user: userData, token: authToken, refresh_token } = response.data.data

      token.value = authToken
      user.value = userData
      isAuthenticated.value = true

      localStorage.setItem('auth_token', authToken)
      localStorage.setItem('refresh_token', refresh_token)

      return { success: true }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed',
      }
    }
  }

  async function register(data: RegisterData) {
    try {
      const response = await apiClient.post('/auth/register', data)
      const { user: userData, token: authToken, refresh_token } = response.data.data

      token.value = authToken
      user.value = userData
      isAuthenticated.value = true

      localStorage.setItem('auth_token', authToken)
      localStorage.setItem('refresh_token', refresh_token)

      return { success: true }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed',
      }
    }
  }

  async function logout() {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      token.value = null
      user.value = null
      isAuthenticated.value = false
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
    }
  }

  async function fetchUser() {
    if (!token.value) return

    try {
      const response = await apiClient.get('/auth/user')
      user.value = response.data.data
    } catch {
      token.value = null
      user.value = null
      isAuthenticated.value = false
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
    }
  }

  function setLoginPath(path: string) {
    loginPath.value = path
  }

  function setRedirectPath(path: string) {
    redirectPath.value = path
  }

  return {
    user,
    token,
    isAuthenticated,
    loginPath,
    redirectPath,
    login,
    register,
    logout,
    fetchUser,
    setLoginPath,
    setRedirectPath,
  }
})