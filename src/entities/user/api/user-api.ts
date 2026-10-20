import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api'
import type { User } from '../model/types'

export const userApi = {
  getById: (id: string) => apiClient.get<User>(`/user-service/users/${id}`),
}

export const userKeys = {
  all: ['user'] as const,
  byId: (id: string) => [...userKeys.all, id] as const,
}

export const useUser = (id: string | undefined) =>
  useQuery({
    queryKey: userKeys.byId(id ?? ''),
    queryFn: () => userApi.getById(id ?? ''),
    enabled: !!id,
  })
