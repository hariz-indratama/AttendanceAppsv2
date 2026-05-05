export interface User {
  id: number
  name: string
  email: string
  role: 'employee' | 'admin'
  hourly_rate: number | null
  department_id: number | null
  avatar: string | null
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface TokenResponse {
  user: User
  token: string
  refresh_token: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}
