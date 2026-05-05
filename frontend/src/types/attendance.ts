export interface Attendance {
  id: number
  user_id: number
  clock_in: string
  clock_out: string | null
  lat_in: number | null
  long_in: number | null
  lat_out: number | null
  long_out: number | null
  status: 'present' | 'late' | 'absent' | 'half_day'
  total_hours: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ClockInRequest {
  latitude: number
  longitude: number
  device_id: string
  biometric_verified: boolean
}

export interface ClockOutRequest {
  latitude: number
  longitude: number
  notes?: string
}

export interface AttendanceSummary {
  total_present: number
  total_late: number
  total_absent: number
  average_hours: number
}
