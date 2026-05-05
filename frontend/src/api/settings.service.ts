import apiClient from './axios'
import type { AppSettings, NotificationSettings, WorkSchedule } from '@/types/settings'
import type { GeofenceLocation } from '@/types/geofence'
import type { ApiResponse } from '@/types/auth'

export const settingsService = {
  async getAppSettings(): Promise<ApiResponse<AppSettings>> {
    const response = await apiClient.get('/settings/app')
    return response.data
  },

  async updateAppSettings(data: Partial<AppSettings>): Promise<ApiResponse<AppSettings>> {
    const response = await apiClient.put('/settings/app', data)
    return response.data
  },

  async getNotificationSettings(): Promise<ApiResponse<NotificationSettings>> {
    const response = await apiClient.get('/settings/notifications')
    return response.data
  },

  async updateNotificationSettings(data: Partial<NotificationSettings>): Promise<ApiResponse<NotificationSettings>> {
    const response = await apiClient.put('/settings/notifications', data)
    return response.data
  },

  async getWorkSchedule(): Promise<ApiResponse<WorkSchedule[]>> {
    const response = await apiClient.get('/settings/schedule')
    return response.data
  },

  async updateWorkSchedule(data: WorkSchedule[]): Promise<ApiResponse<WorkSchedule[]>> {
    const response = await apiClient.put('/settings/schedule', { schedule: data })
    return response.data
  },

  async getGeofences(): Promise<ApiResponse<GeofenceLocation[]>> {
    const response = await apiClient.get('/settings/geofences')
    return response.data
  },

  async createGeofence(data: Omit<GeofenceLocation, 'office_id'>): Promise<ApiResponse<GeofenceLocation>> {
    const response = await apiClient.post('/settings/geofences', data)
    return response.data
  },

  async updateGeofence(id: number, data: Partial<GeofenceLocation>): Promise<ApiResponse<GeofenceLocation>> {
    const response = await apiClient.put(`/settings/geofences/${id}`, data)
    return response.data
  },

  async deleteGeofence(id: number): Promise<void> {
    await apiClient.delete(`/settings/geofences/${id}`)
  },
}