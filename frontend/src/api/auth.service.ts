import apiClient from './axios'
import type { User, LoginCredentials, TokenResponse } from '@/types/auth'
import type { ApiResponse } from '@/types/auth'

export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<TokenResponse>> {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },

  async register(data: {
    name: string
    email: string
    password: string
    password_confirmation: string
  }): Promise<ApiResponse<TokenResponse>> {
    const response = await apiClient.post('/auth/register', data)
    return response.data
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<TokenResponse>> {
    const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken })
    return response.data
  },

  async getUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get('/auth/user')
    return response.data
  },
}