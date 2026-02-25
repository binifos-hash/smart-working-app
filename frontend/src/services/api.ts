import axios from 'axios'
import type { AuthUser, SmartWorkingRequest, Employee } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('auth_user')
  if (stored) {
    const user: AuthUser = JSON.parse(stored)
    config.headers.Authorization = `Bearer ${user.token}`
  }
  return config
})

// Auth
export const login = (email: string, password: string) =>
  api.post<AuthUser>('/auth/login', { email, password }).then((r) => r.data)

export const register = (email: string, firstName: string, lastName: string, password: string) =>
  api.post<AuthUser>('/auth/register', { email, firstName, lastName, password }).then((r) => r.data)

// Requests
export const getMyRequests = () =>
  api.get<SmartWorkingRequest[]>('/requests').then((r) => r.data)

export const getAllRequests = () =>
  api.get<SmartWorkingRequest[]>('/requests/all').then((r) => r.data)

export const createRequest = (date: string, description?: string) =>
  api
    .post<SmartWorkingRequest>('/requests', { date, description })
    .then((r) => r.data)

export const updateRequestStatus = (id: number, status: 'Approved' | 'Rejected') =>
  api.put<SmartWorkingRequest>(`/requests/${id}/status`, { status }).then((r) => r.data)

export const handleEmailAction = (token: string, action: string) =>
  api
    .get<{ message: string }>('/requests/action', { params: { token, action } })
    .then((r) => r.data)

// Users
export const getEmployees = () =>
  api.get<Employee[]>('/users/employees').then((r) => r.data)
