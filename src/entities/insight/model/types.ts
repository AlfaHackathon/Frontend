export type InsightCategory = 'risks' | 'opportunities' | 'events' | 'peers'

export type InsightTone = 'red' | 'blue' | 'green'

export type InsightIconKind = 'risk' | 'credit-risk' | 'rate' | 'growth' | 'price-lock'

export interface Insight {
  id: string
  category: InsightCategory
  icon: InsightIconKind
  tone: InsightTone
  label: string
  time: string
  title: string
  summary: string
  tag: { text: string; tone: InsightTone }
  sources: string
  status: string
  pending: boolean
  questions: string[]
}

export interface InsightDetails extends Insight {
  analysis: string
  recommendations: string[]
}

export interface InsightFilters {
  category?: InsightCategory
}

export const categoryLabels: Record<InsightCategory, string> = {
  risks: 'Риски',
  opportunities: 'Возможности',
  events: 'События',
  peers: 'Похожие компании',
}
