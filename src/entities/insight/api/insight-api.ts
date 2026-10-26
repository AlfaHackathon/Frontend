import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api'
import { env } from '@/shared/config'
import { demoInsights } from '../model/demo-insights'
import { toInsight, toPublicCategory, type PublicInsightFeed } from '../model/public-insight'
import type { Insight, InsightDetails, InsightFilters } from '../model/types'

const FEED_PAGE_LIMIT = 20
const FEED_MAX_PAGES = 5

export const insightApi = {
  getList: async (filters: InsightFilters = {}) => {
    if (env.useMocks) {
      return Promise.resolve<Insight[]>(filters.category
        ? demoInsights.filter((insight) => insight.category === filters.category)
        : demoInsights)
    }
    const items: Insight[] = []
    let cursor: string | null = null
    for (let page = 0; page < FEED_MAX_PAGES; page++) {
      const params = new URLSearchParams({ kind: 'personal', limit: String(FEED_PAGE_LIMIT) })
      const category = filters.category && toPublicCategory[filters.category]
      if (category) params.set('category', category)
      if (cursor) params.set('cursor', cursor)
      const feed: PublicInsightFeed = await apiClient.get<PublicInsightFeed>(`/insight-service/insights?${params}`)
      items.push(...feed.items.map(toInsight))
      cursor = feed.nextCursor
      if (!cursor || items.length >= FEED_PAGE_LIMIT) break
    }
    return items
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
