export type InsightCategory = 'risks' | 'opportunities' | 'events' | 'peers'

export type InsightTone = 'red' | 'blue' | 'green'

export type InsightIconKind = 'risk' | 'credit-risk' | 'rate' | 'growth' | 'price-lock'

export interface Insight {
  id: string
  kind?: 'personal' | 'general'
  newsMaterialId?: string
  revisionCreatedAt?: string
  category: InsightCategory | null
  icon: InsightIconKind
  tone: InsightTone
  label: string
  time: string
  sortAt?: string
  title: string
  summary: string
  tag?: { text: string; tone: InsightTone }
  sources: string
  status: string
  pending: boolean
  questions: string[]
}

export interface InsightDetails extends Insight {
  analysis: string
  recommendations: string[]
  importance?: { score: number | null; rationale: string }
  indicators?: { value: string; unit: string | null; period: string | null; baselinePeriod: string | null; arithmeticOnly: boolean }[]
  sourceDetails?: { title: string; sourceUrl: string | null }[]
  detail?: InsightBreakdown
}

export interface InsightBreakdown {
  owner: string
  updatedAt: string
  lead: string
  impact: {
    description: string
    baselineLabel: string
    stressLabel: string
    rows: { metric: string; baseline: string; stress: string; reason: string }[]
  }
  evidence: { source: string; finding: string }[]
  risks: string[]
  opportunities: string[]
  decisions: string[]
  bankView: {
    description: string
    quote: string
    source: string
    market: string
    company: string
  }
  sources: { kind: string; origin: string; title: string }[]
  related?: { id: string; title: string }[]
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
