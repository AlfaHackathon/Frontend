import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api'
import { env } from '@/shared/config'
import { demoInsights } from '../model/demo-insights'
import type { Insight, InsightDetails, InsightFilters } from '../model/types'

export const insightApi = {
  getList: (filters: InsightFilters = {}) => {
    if (env.useMocks) {
      return Promise.resolve<Insight[]>(filters.category
        ? demoInsights.filter((insight) => insight.category === filters.category)
        : demoInsights)
    }
    const params = new URLSearchParams()
    if (filters.category) params.set('category', filters.category)
    const query = params.size ? `?${params}` : ''
    return apiClient.get<Insight[]>(`/insight-service/insights${query}`)
  },
  getById: (id: string) => {
    if (env.useMocks) {
      const insight = demoInsights.find((item) => item.id === id)
      return insight
        ? Promise.resolve<InsightDetails>(insight)
        : Promise.reject<InsightDetails>(new Error('Инсайт не найден'))
    }
    return apiClient.get<InsightDetails>(`/insight-service/insights/${id}`)
  },
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
