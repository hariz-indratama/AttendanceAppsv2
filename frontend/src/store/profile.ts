import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authService } from '@/api/auth.service'
import { apiClient } from '@/api/axios'
import type { User } from '@/types/auth'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProfile() {
    isLoading.value = true
    error.value = null
    try {
      const response = await authService.getUser()
      profile.value = response.data
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err.response?.data?.message || 'Failed to fetch profile'
    } finally {
      isLoading.value = false
    }
  }

  async function updateProfile(data: Partial<User>) {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiClient.put('/auth/profile', data)
      profile.value = response.data
      return { success: true }
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err.response?.data?.message || 'Failed to update profile'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  function clear() {
    profile.value = null
    error.value = null
  }

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    clear,
  }
})
