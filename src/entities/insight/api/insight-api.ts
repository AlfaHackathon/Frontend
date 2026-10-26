import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api'
import { env } from '@/shared/config'
import { demoInsights } from '../model/demo-insights'
import { toInsight, toInsightDetails, toPublicCategory, type PublicInsight, type PublicInsightFeed } from '../model/public-insight'
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
      items.push(...(feed.items ?? []).map(toInsight))
      cursor = feed.nextCursor
      if (!cursor || items.length >= FEED_PAGE_LIMIT) break
    }
    return items
  },
  getById: async (id: string, kind?: 'personal' | 'general'): Promise<InsightDetails> => {
    if (env.useMocks) {
      const insight = demoInsights.find((item) => item.id === id)
      if (!insight) throw new Error('Инсайт не найден')
      return insight
    }
    const getCard = (cardKind: 'personal' | 'general') =>
      apiClient.get<PublicInsight>(`/insight-service/insights/${cardKind}/${encodeURIComponent(id)}`)
    if (kind) return toInsightDetails(await getCard(kind))
    try {
      return toInsightDetails(await getCard('personal'))
    } catch (error) {
      if (!error || typeof error !== 'object' || !('status' in error) || error.status !== 404) throw error
      return toInsightDetails(await getCard('general'))
    }
  },
}

export const insightKeys = {
  all: ['insight'] as const,
  list: (filters: InsightFilters) => [...insightKeys.all, 'list', filters] as const,
  details: (id: string, kind?: 'personal' | 'general') => [...insightKeys.all, 'details', kind, id] as const,
}

export const useInsights = (filters: InsightFilters = {}) =>
  useQuery({ queryKey: insightKeys.list(filters), queryFn: () => insightApi.getList(filters) })

export const useInsight = (id: string, kind?: 'personal' | 'general') =>
  useQuery({ queryKey: insightKeys.details(id, kind), queryFn: () => insightApi.getById(id, kind) })
