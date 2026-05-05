export interface LeaveRequest {
  id: number
  user_id: number
  type: 'sick' | 'vacation' | 'personal' | 'other'
  start_date: string
  end_date: string
  reason: string | null
  status: 'pending' | 'approved' | 'rejected'
  approved_by: number | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

export interface LeaveBalance {
  sick_used: number
  sick_total: number
  vacation_used: number
  vacation_total: number
  personal_used: number
  personal_total: number
}
