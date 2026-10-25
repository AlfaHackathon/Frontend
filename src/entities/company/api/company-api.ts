import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api'
import type { Company, CompanyGroup, CompanyMember } from '../model/types'

export const companyApi = {
  getMy: () => apiClient.get<Company>('/company-service/companies/me'),
  getMembers: () => apiClient.get<CompanyMember[]>('/company-service/companies/me/members'),
  getGroup: () => apiClient.get<CompanyGroup>('/company-service/companies/me/group'),
}

export const companyKeys = {
  all: ['company'] as const,
  my: () => [...companyKeys.all, 'my'] as const,
  members: () => [...companyKeys.all, 'members'] as const,
  group: () => [...companyKeys.all, 'group'] as const,
}

export const useMyCompany = (enabled = true) =>
  useQuery({ queryKey: companyKeys.my(), queryFn: companyApi.getMy, enabled })

export const useCompanyMembers = (enabled = true) =>
  useQuery({ queryKey: companyKeys.members(), queryFn: companyApi.getMembers, enabled })

export const useCompanyGroup = (enabled = true) =>
  useQuery({ queryKey: companyKeys.group(), queryFn: companyApi.getGroup, enabled })
