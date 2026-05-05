export interface AppSettings {
  company_name: string
  timezone: string
  work_start_time: string
  work_end_time: string
  overtime_threshold_hours: number
  late_threshold_minutes: number
}

export interface NotificationSettings {
  push_enabled: boolean
  email_enabled: boolean
  clock_in_reminder: boolean
  clock_out_reminder: boolean
  payroll_notifications: boolean
}

export interface WorkSchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  enabled: boolean
  start_time: string
  end_time: string
}
