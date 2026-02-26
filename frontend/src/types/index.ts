export type UserRole = 'Employee' | 'Manager'
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected'

export interface AuthUser {
  token: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  userId: number
  mustChangePassword?: boolean
}

export interface SmartWorkingRequest {
  id: number
  userId: number
  employeeName: string
  employeeEmail: string
  date: string // ISO date string "YYYY-MM-DD"
  description?: string
  status: RequestStatus
  createdAt: string
}

export interface Employee {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
}
