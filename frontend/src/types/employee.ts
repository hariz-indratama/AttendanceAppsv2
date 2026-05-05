export interface Employee {
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

export interface CreateEmployee {
  name: string
  email: string
  password: string
  role: 'employee' | 'admin'
  hourly_rate?: number
  department_id?: number
}

export interface UpdateEmployee {
  name?: string
  email?: string
  role?: 'employee' | 'admin'
  hourly_rate?: number
  department_id?: number
  avatar?: string
}
