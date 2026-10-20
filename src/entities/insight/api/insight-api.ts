import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api'
import type { Insight, InsightDetails, InsightFilters } from '../model/types'

export const insightApi = {
  getList: (filters: InsightFilters = {}) => {
    const params = new URLSearchParams()
    if (filters.impact) params.set('impact', filters.impact)
    const query = params.size ? `?${params}` : ''
    return apiClient.get<Insight[]>(`/insight-service/insights${query}`)
  },
  getById: (id: string) => apiClient.get<InsightDetails>(`/insight-service/insights/${id}`),
}

export const insightKeys = {
  all: ['insight'] as const,
  list: (filters: InsightFilters) => [...insightKeys.all, 'list', filters] as const,
  details: (id: string) => [...insightKeys.all, 'details', id] as const,
}

export const useInsights = (filters: InsightFilters = {}) =>
  useQuery({ queryKey: insightKeys.list(filters), queryFn: () => insightApi.getList(filters) })

export const useInsight = (id: string) =>
  useQuery({ queryKey: insightKeys.details(id), queryFn: () => insightApi.getById(id) })
