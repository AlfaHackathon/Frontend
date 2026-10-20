import { Link, useParams } from 'react-router'
import { impactLabels, metricLabels, useInsight } from '@/entities/insight'
import { AgentChat } from '@/features/agent-chat'
import { routes } from '@/shared/config'
import { formatDate, formatPercent } from '@/shared/lib'
import { Badge, Card, Spinner } from '@/shared/ui'
import styles from './InsightPage.module.css'

export function InsightPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { data: insight, isPending, isError } = useInsight(id)

  if (isPending) return <Spinner />
  if (isError)
    return (
      <p>
        Инсайт не найден. <Link to={routes.feed}>Вернуться в ленту</Link>
      </p>
    )

  return (
    <div className={styles.layout}>
      <article className={styles.main}>
        <Link to={routes.feed} className={styles.back}>
          ← Лента
        </Link>
        <div className={styles.meta}>
          <Badge tone={insight.impact}>{impactLabels[insight.impact]}</Badge>
          <span>
            {insight.source} · {formatDate(insight.publishedAt)}
          </span>
        </div>
        <h1 className="page-title">{insight.title}</h1>

        <div className={styles.effects}>
          {insight.effects.map((effect) => (
            <Card key={effect.metric} className={styles.effect}>
              <span>{metricLabels[effect.metric]}</span>
              <b data-positive={effect.change > 0}>{formatPercent(effect.change)}</b>
            </Card>
          ))}
        </div>

        <section>
          <h2>Что произошло и почему это важно</h2>
          <p>{insight.analysis}</p>
        </section>

        <section>
          <h2>Что можно сделать</h2>
          <ul>
            {insight.recommendations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </article>

      <aside className={styles.aside}>
        <AgentChat insightId={insight.id} />
      </aside>
    </div>
  )
}
