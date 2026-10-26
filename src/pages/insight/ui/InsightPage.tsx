import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Check, MessageCircle, Sparkles } from 'lucide-react'
import { useInsight, type InsightDetails } from '@/entities/insight'
import { routes } from '@/shared/config'
import { InsightAssistant, type InsightAssistantTransport } from './InsightAssistant'
import styles from './InsightPage.module.css'

// Supply an insight-aware transport here when the assistant API is available.
const assistantTransport: InsightAssistantTransport | undefined = undefined

function DetailedContent({ insight }: { insight: InsightDetails }) {
  const detail = insight.detail!
  return <div className={styles.detailGrid}>
    <div className={styles.sections}>
      <section className={styles.card} aria-labelledby="impact-title">
        <h2 id="impact-title">Как это повлияет на показатели</h2>
        <p className={styles.sectionLead}>{detail.impact.description}</p>
        <div className={styles.tableScroll}><table className={styles.impactTable}>
          <thead><tr><th>Показатель</th><th>{detail.impact.baselineLabel}</th><th>{detail.impact.stressLabel}</th><th>Почему так</th></tr></thead>
          <tbody>{detail.impact.rows.map((row) => <tr key={row.metric}><th scope="row">{row.metric}</th><td>{row.baseline}</td><td>{row.stress}</td><td>{row.reason}</td></tr>)}</tbody>
        </table></div>
      </section>
      <section className={styles.card} aria-labelledby="company-title">
        <div className={styles.sectionTitle}><h2 id="company-title">Почему это касается вас</h2><span className={styles.aiBadge}><Sparkles size={13} />Вывод от AI</span></div>
        <div className={styles.quoteGrid}>{detail.evidence.map((item) => <blockquote key={item.source}><small>{item.source}</small><p>{item.finding}</p></blockquote>)}</div>
        <div className={styles.twoColumns}>
          <div><h3>Чем рискуете</h3><ul className={styles.riskList}>{detail.risks.map((risk) => <li key={risk}>{risk}</li>)}</ul></div>
          <div><h3>Что можно выиграть</h3><ul className={styles.goodList}>{detail.opportunities.map((opportunity) => <li key={opportunity}>{opportunity}</li>)}</ul></div>
        </div>
        <h3>Варианты решений</h3>
        <div className={styles.decisionList}>{detail.decisions.map((decision) => <span key={decision}>{decision}</span>)}</div>
      </section>
      <section className={styles.card} aria-labelledby="bank-title">
        <h2 id="bank-title">Как оценивает Альфа-Банк</h2>
        <p className={styles.sectionLead}>{detail.bankView.description}</p>
        <blockquote className={styles.bankQuote}><p>{detail.bankView.quote}</p><small>{detail.bankView.source}</small></blockquote>
        <div className={styles.twoColumns}>
          <div className={styles.conclusion}><small>для всего рынка</small><p>{detail.bankView.market}</p></div>
          <div className={styles.conclusion}><small>для «Апельсина» <span className={styles.aiBadge}><Sparkles size={13} />Вывод от AI</span></small><p>{detail.bankView.company}</p></div>
        </div>
      </section>
      <Feedback />
    </div>
    <aside className={styles.rail} aria-label="Источники и действия">
      <section className={styles.railCard}><h2>Источники</h2>{detail.sources.map((source) => <div className={styles.source} key={source.title}><span className={styles.sourceKind}>{source.kind}</span><small>{source.origin}</small><strong>{source.title}</strong></div>)}</section>
      {detail.related && <section className={styles.railCard}><h2>Связанные инсайты</h2>{detail.related.map((item) => <Link className={styles.relatedLink} to={routes.insight(item.id)} key={item.id}>{item.title} <span aria-hidden="true">→</span></Link>)}</section>}
    </aside>
  </div>
}

function Feedback() {
  const [score, setScore] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  return <section className={styles.card} aria-labelledby="feedback-title">
    <h2 id="feedback-title">Насколько полезен этот инсайт?</h2>
    <p className={styles.sectionLead}>Помогите сделать следующие инсайты полезнее для вашей компании.</p>
    {submitted ? <p className={styles.feedbackThanks}><Check size={18} />Оценка отмечена на этой странице</p> : <>
      <div className={styles.rating} role="group" aria-label="Оценка полезности от 1 до 10">{Array.from({ length: 10 }, (_, index) => index + 1).map((value) => <button key={value} type="button" aria-pressed={score === value} onClick={() => setScore(value)}>{value}</button>)}</div>
      <div className={styles.ratingCaptions}><span>Не помог разобраться</span><span>Помог принять решение</span></div>
      <form className={styles.feedbackForm} onSubmit={(event) => { event.preventDefault(); if (score !== null) setSubmitted(true) }}>
        <label htmlFor="insight-comment">Комментарий (необязательно)</label>
        <div><input id="insight-comment" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Что стоит улучшить?" /><button type="submit" disabled={score === null}>Отправить оценку</button></div>
      </form>
    </>}
  </section>
}

function OtherDetail({ insight }: { insight: InsightDetails }) {
  return <div className={styles.otherDetail}>
    <section className={styles.card}><h2>О разборе</h2><p>{insight.analysis || insight.summary}</p>{insight.recommendations.length > 0 && <><h3>Варианты решений</h3><ul>{insight.recommendations.map((item) => <li key={item}>{item}</li>)}</ul></>}</section>
    <aside className={styles.railCard}><h2>Источники</h2><p>{insight.sources}</p></aside>
  </div>
}

export function InsightPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { data: insight, isPending, isError, refetch } = useInsight(id)
  const [assistantOpen, setAssistantOpen] = useState(false)

  if (isPending) return <div className={styles.state} role="status">Загружаем разбор инсайта…</div>
  if (isError || !insight) return <div className={styles.state} role="alert"><h1>Не удалось открыть инсайт</h1><p>Проверьте ссылку или попробуйте ещё раз.</p><button type="button" onClick={() => void refetch()}>Повторить</button><Link to={routes.feed}>К списку инсайтов</Link></div>

  return <div className={styles.page}>
    <div className={styles.toolbar}><div><Link className={styles.back} to={routes.feed}><ArrowLeft size={18} />Все инсайты</Link><h1>Разбор инсайта</h1></div><span className={styles.toolbarStatus}>Брифинг <span>·</span> Инсайты</span></div>
    <div className={styles.hero}><div className={styles.meta}><span className={styles.severity} data-tone={insight.tone}>● {insight.label}</span><span>{insight.detail ? `Ответственный: ${insight.detail.owner} · ${insight.detail.updatedAt}` : insight.time}</span></div><div className={styles.heroHeading}><h2>{insight.title}</h2><button type="button" className={styles.askButton} onClick={() => setAssistantOpen(true)}><MessageCircle size={18} />Спросить по инсайту <span aria-hidden="true">→</span></button></div><p>{insight.detail?.lead ?? insight.summary}</p></div>
    {insight.detail ? <DetailedContent key={insight.id} insight={insight} /> : <OtherDetail insight={insight} />}
    {assistantOpen && <InsightAssistant insight={insight} transport={assistantTransport} onClose={() => setAssistantOpen(false)} />}
  </div>
}
