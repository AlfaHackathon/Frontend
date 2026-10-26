import type { Insight, InsightCategory, InsightDetails, InsightIconKind, InsightTone } from './types'

type PublicCategory = 'risk' | 'opportunity' | 'event'

interface PublicInsightSource {
  kind: string | null
  title: string | null
  provenance: { sourceUrl: string | null } | null
}

interface PublicInsightIndicator {
  metric: string | null
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
    question: { mechanism: string | null } | null
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

function formatTime(iso: string | null | undefined) {
  const date = new Date(iso ?? '')
  if (Number.isNaN(date.getTime())) return ''
  const days = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) / 86_400_000)
  if (days === 0) return `сегодня, ${timeFormatter.format(date)}`
  if (days === 1) return `вчера, ${timeFormatter.format(date)}`
  return dayFormatter.format(date)
}

const subjects: Record<string, string> = {
  financing_cost: 'Расходы на обслуживание долга',
  purchase_cost: 'Расходы на закупки',
  fuel_cost: 'Расходы на топливо',
}

const units: Record<string, string> = { RUB: '₽', USD: '$', EUR: '€' }

function formatAmount(value: string) {
  const [int, fraction] = value.replace('-', '').split('.')
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') + (fraction ? `,${fraction}` : '')
}

function indicatorTitle(indicator: PublicInsightIndicator | undefined, mechanism: string | null | undefined) {
  if (!indicator?.value || !/^-?\d+(\.\d+)?$/.test(indicator.value)) return null
  const negative = indicator.value.startsWith('-')
  const amount = `${formatAmount(indicator.value)}\u00a0${units[indicator.unit ?? ''] ?? indicator.unit ?? ''}`.trim()
  const period = !indicator.period
    ? ''
    : /^\d{4}$/.test(indicator.period)
      ? ` в ${indicator.period} году`
      : ` (${indicator.period})`
  if (indicator.metric === 'revenue_delta') {
    return `Выручка ${negative ? 'снизится' : 'вырастет'} на ${amount}${period}`
  }
  if (indicator.metric === 'expense_delta') {
    const subject = (mechanism && subjects[mechanism]) || 'Расходы'
    return `${subject} ${negative ? 'снизятся' : 'вырастут'} на ${amount}${period}`
  }
  return null
}

function cleanConclusion(text: string) {
  return text.replace(/;?\s*объект\s+\S+?(?=[.;]|$)/gi, '').trim()
}

function sourceLabel(kind: string | null) {
  const value = kind?.toLowerCase() ?? ''
  if (value.includes('news')) return 'Новости'
  if (value.includes('bank') || value.includes('analyt')) return 'Аналитика Альфа-Банка'
  if (value) return 'Документы компании'
  return null
}

function sourcesText(sources: PublicInsightSource[] | null) {
  const list = sources ?? []
  const labels = [...new Set(list.map((source) => sourceLabel(source.kind)).filter(Boolean))]
  if (labels.length) return labels.join(', ')
  if (!list.length) return ''
  const n = list.length
  const word = n % 10 === 1 && n % 100 !== 11 ? 'источник' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'источника' : 'источников'
  return `${n} ${word}`
}

function splitConclusion(text: string) {
  const match = text.match(/^(.+?[.!?])\s+(.+)$/s)
  return match ? { title: match[1], rest: match[2] } : { title: text, rest: '' }
}

export function toInsight(item: PublicInsight): Insight {
  const revision = 'currentRevision' in item && item.currentRevision ? item.currentRevision : null
  const general = !revision && 'insight' in item ? item.insight : null
  const publicCategory = (revision ? revision.category : general?.category) ?? null
  const meta = (publicCategory && categories[publicCategory]) || unknownCategory
  const conclusion = splitConclusion(
    cleanConclusion((revision ? revision.conclusion : general?.conclusion) ?? ''),
  )
  const generalTitle = general?.title ?? null
  const importance = importanceLabel(revision?.companyImportance?.score)

  return {
    id: item.id,
    kind: revision ? 'personal' : 'general',
    newsMaterialId: item.newsMaterialId ?? undefined,
    revisionCreatedAt: revision?.createdAt,
    category: meta.category,
    icon: meta.icon,
    tone: meta.tone,
    label: [meta.label, importance].filter(Boolean).join(' · '),
    time: formatTime(revision ? revision.createdAt : 'updatedAt' in item ? item.updatedAt : null),
    title:
      generalTitle ??
      indicatorTitle(item.indicators?.[0], revision?.question?.mechanism) ??
      conclusion.title,
    summary: generalTitle
      ? [conclusion.title, conclusion.rest].filter(Boolean).join(' ')
      : revision?.companyImportance?.rationale || conclusion.rest,
    tag: item.indicators?.length ? { text: 'Расчёт', tone: 'green' } : undefined,
    sources: sourcesText(item.sources),
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
    analysis: cleanConclusion(conclusion ?? '') || insight.summary,
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
