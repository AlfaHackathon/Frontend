import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api'
import { env } from '@/shared/config'
import { demoInsights } from '../model/demo-insights'
import { toInsight, toInsightDetails, toPublicCategory, type PublicInsight, type PublicInsightFeed } from '../model/public-insight'
import type { Insight, InsightDetails, InsightFilters } from '../model/types'

const FEED_PAGE_LIMIT = 20
type InsightKind = 'personal' | 'general'

interface InsightPage {
  items: Insight[]
  nextCursor: string | null
}

export function sortInsights(items: Insight[]): Insight[] {
  return [...items].sort((a, b) => {
    const aTime = Date.parse(a.sortAt ?? '') || 0
    const bTime = Date.parse(b.sortAt ?? '') || 0
    return bTime - aTime
  })
}

export const insightApi = {
  getPage: async (kind: InsightKind, filters: InsightFilters = {}, cursor?: string): Promise<InsightPage> => {
    if (env.useMocks) {
      return {
        items: demoInsights.filter((insight) =>
          (insight.kind ?? 'personal') === kind && (!filters.category || insight.category === filters.category)),
        nextCursor: null,
      }
    }
    const params = new URLSearchParams({ kind, limit: String(FEED_PAGE_LIMIT) })
    const category = filters.category && toPublicCategory[filters.category]
    if (category) params.set('category', category)
    if (cursor) params.set('cursor', cursor)
    const feed: PublicInsightFeed = await apiClient.get<PublicInsightFeed>(`/insight-service/insights?${params}`)
    return {
      items: (feed.items ?? []).map(toInsight),
      nextCursor: feed.nextCursor || null,
    }
  },
  getList: async (filters: InsightFilters = {}): Promise<Insight[]> => {
    const [personal, general] = await Promise.all([
      insightApi.getPage('personal', filters),
      insightApi.getPage('general', filters),
    ])
    return sortInsights([...personal.items, ...general.items])
  },
  getById: async (id: string, kind?: InsightKind): Promise<InsightDetails> => {
    if (env.useMocks) {
      const insight = demoInsights.find((item) => item.id === id)
      if (!insight) throw new Error('Инсайт не найден')
      return insight
    }
    const getCard = (cardKind: InsightKind) =>
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
  feed: (kind: InsightKind, filters: InsightFilters) => [...insightKeys.all, 'feed', kind, filters] as const,
  details: (id: string, kind?: InsightKind) => [...insightKeys.all, 'details', kind, id] as const,
}

export const useInsights = (filters: InsightFilters = {}) =>
  useQuery({ queryKey: insightKeys.list(filters), queryFn: () => insightApi.getList(filters) })

export const useInfiniteInsights = (kind: InsightKind, filters: InsightFilters = {}) =>
  useInfiniteQuery({
    queryKey: insightKeys.feed(kind, filters),
    queryFn: ({ pageParam }) => insightApi.getPage(kind, filters, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  })

export const useInsight = (id: string, kind?: InsightKind) =>
  useQuery({ queryKey: insightKeys.details(id, kind), queryFn: () => insightApi.getById(id, kind) })
