import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api'
import type { Company } from '../model/types'

export const companyApi = {
  getMy: () => apiClient.get<Company>('/company-service/companies/my'),
}

export const companyKeys = {
  all: ['company'] as const,
  my: () => [...companyKeys.all, 'my'] as const,
}

export const useMyCompany = () =>
  useQuery({ queryKey: companyKeys.my(), queryFn: companyApi.getMy })
