export type InsightImpact = 'positive' | 'negative' | 'neutral'

export type InsightMetric = 'revenue' | 'margin' | 'debt'

export interface InsightEffect {
  metric: InsightMetric
  change: number
}

export interface Insight {
  id: string
  title: string
  summary: string
  impact: InsightImpact
  effects: InsightEffect[]
  source: string
  publishedAt: string
}

export interface InsightDetails extends Insight {
  analysis: string
  recommendations: string[]
}

export interface InsightFilters {
  impact?: InsightImpact
}

export const metricLabels: Record<InsightMetric, string> = {
  revenue: 'Выручка',
  margin: 'Маржа',
  debt: 'Долг',
}

export const impactLabels: Record<InsightImpact, string> = {
  positive: 'Возможность',
  negative: 'Риск',
  neutral: 'К сведению',
}
