import type { Insight, InsightCategory, InsightDetails, InsightIconKind, InsightTone } from './types'

type PublicCategory = 'risk' | 'opportunity' | 'event'

interface PublicInsightSource {
  title: string | null
  provenance: { sourceUrl: string | null } | null
}

interface PublicInsightIndicator {
  value: string | null
  unit: string | null
  period: string | null
  baselinePeriod: string | null
  evidenceStatus: string | null
  arithmeticOnly: boolean | null
}

interface PublicInsightBase {
  id: string
  newsMaterialId: string | null
  sources: PublicInsightSource[] | null
  indicators: PublicInsightIndicator[] | null
  requiresReassessment: boolean | null
}

export interface PublicPersonalInsight extends PublicInsightBase {
  kind: 'personal'
  currentRevision: {
    conclusion: string | null
    createdAt: string
    category: PublicCategory | null
    companyImportance: { score: number | null; rationale: string } | null
  }
}

export interface PublicGeneralInsight extends PublicInsightBase {
  kind: 'general'
  updatedAt: string
  insight: {
    title: string | null
    conclusion: string | null
    category: PublicCategory | null
  }
}

export type PublicInsight = PublicPersonalInsight | PublicGeneralInsight

export interface PublicInsightFeed {
  items: PublicInsight[] | null
  nextCursor: string | null
  exhaustive: boolean
}

export const toPublicCategory: Partial<Record<InsightCategory, PublicCategory>> = {
  risks: 'risk',
  opportunities: 'opportunity',
  events: 'event',
}

const categories: Record<
  PublicCategory,
  { category: InsightCategory; label: string; tone: InsightTone; icon: InsightIconKind }
> = {
  risk: { category: 'risks', label: 'Риск', tone: 'red', icon: 'risk' },
  opportunity: { category: 'opportunities', label: 'Возможность', tone: 'green', icon: 'growth' },
  event: { category: 'events', label: 'Событие', tone: 'blue', icon: 'rate' },
}

const unknownCategory = { category: null, label: 'Инсайт', tone: 'blue', icon: 'rate' } as const

function importanceLabel(score: number | null | undefined) {
  if (!score) return null
  if (score >= 4) return 'сильное влияние'
  if (score === 3) return 'среднее влияние'
  return 'слабое влияние'
}

const timeFormatter = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' })
const dayFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })

function formatTime(iso: string) {
  const date = new Date(iso)
  const days = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(iso).setHours(0, 0, 0, 0)) / 86_400_000)
  if (days === 0) return `сегодня, ${timeFormatter.format(date)}`
  if (days === 1) return `вчера, ${timeFormatter.format(date)}`
  return dayFormatter.format(date)
}

function splitConclusion(text: string) {
  const match = text.match(/^(.+?[.!?])\s+(.+)$/s)
  return match ? { title: match[1], rest: match[2] } : { title: text, rest: '' }
}

export function toInsight(item: PublicInsight): Insight {
  const revision = item.kind === 'personal' ? item.currentRevision : null
  const publicCategory = revision ? revision.category : item.kind === 'general' ? item.insight.category : null
  const meta = publicCategory ? categories[publicCategory] : unknownCategory
  const conclusion = splitConclusion(
    (revision ? revision.conclusion : item.kind === 'general' ? item.insight.conclusion : null) ?? '',
  )
  const generalTitle = item.kind === 'general' ? item.insight.title : null
  const importance = importanceLabel(revision?.companyImportance?.score)

  return {
    id: item.id,
    kind: item.kind,
    newsMaterialId: item.newsMaterialId ?? undefined,
    revisionCreatedAt: revision?.createdAt,
    category: meta.category,
    icon: meta.icon,
    tone: meta.tone,
    label: [meta.label, importance].filter(Boolean).join(' · '),
    time: formatTime(revision ? revision.createdAt : item.kind === 'general' ? item.updatedAt : ''),
    title: generalTitle ?? conclusion.title,
    summary: generalTitle
      ? [conclusion.title, conclusion.rest].filter(Boolean).join(' ')
      : revision?.companyImportance?.rationale || conclusion.rest,
    tag: item.indicators?.length ? { text: 'Расчёт', tone: 'green' } : undefined,
    sources: (item.sources ?? [])
      .map((source) => source.title)
      .filter(Boolean)
      .join(', '),
    status: item.requiresReassessment ? 'Требует переоценки' : '',
    pending: false,
    questions: [],
  }
}

export function toInsightDetails(item: PublicInsight): InsightDetails {
  const insight = toInsight(item)
  const conclusion = item.kind === 'personal' ? item.currentRevision?.conclusion : item.insight?.conclusion
  return {
    ...insight,
    analysis: conclusion ?? insight.summary,
    recommendations: [],
    importance: item.kind === 'personal' && item.currentRevision.companyImportance
      ? { score: item.currentRevision.companyImportance.score, rationale: item.currentRevision.companyImportance.rationale }
      : undefined,
    indicators: (item.indicators ?? [])
      .filter((indicator) => indicator.evidenceStatus === 'supported' && typeof indicator.value === 'string' && /^-?\d+(?:\.\d+)?$/.test(indicator.value))
      .map((indicator) => ({
        value: indicator.value!,
        unit: indicator.unit,
        period: indicator.period,
        baselinePeriod: indicator.baselinePeriod,
        arithmeticOnly: indicator.arithmeticOnly === true,
      })),
    sourceDetails: (item.sources ?? []).map((source, index) => ({
      title: source.title?.trim() || `Источник ${index + 1}`,
      sourceUrl: source.provenance?.sourceUrl ?? null,
    })),
  }
}
