import { apiClient } from '@/shared/api'
import type { LoginCredentials, RegisterPayload, Session } from '../model/types'

export const sessionApi = {
  login: (credentials: LoginCredentials) => apiClient.post<Session>('/auth/login', credentials),
  register: (payload: RegisterPayload) => apiClient.post<Session>('/auth/register', payload),
}
