export interface Payroll {
  id: number
  user_id: number
  month: number
  year: number
  gross_salary: number
  net_salary: number
  total_hours: number
  overtime_hours: number
  bonuses: number
  deductions: number
  late_deductions: number
  status: 'draft' | 'pending' | 'approved' | 'paid'
  processed_at: string | null
  created_at: string
  updated_at: string
}

export interface PayrollItem {
  employee_id: number
  employee_name: string
  base_hours: number
  overtime_hours: number
  hourly_rate: number
  gross: number
  deductions: number
  net: number
}

export interface DeductionItem {
  type: 'late' | 'absent' | 'other'
  amount: number
  reason: string
}
