import { Link } from 'react-router'
import { routes } from '@/shared/config'
import { formatDate, formatPercent } from '@/shared/lib'
import { Badge, Card } from '@/shared/ui'
import { impactLabels, metricLabels, type Insight } from '../model/types'
import styles from './InsightCard.module.css'

export function InsightCard({ insight }: { insight: Insight }) {
  return (
    <Card className={styles.card}>
      <div className={styles.meta}>
        <Badge tone={insight.impact}>{impactLabels[insight.impact]}</Badge>
        <span>
          {insight.source} · {formatDate(insight.publishedAt)}
        </span>
      </div>
      <Link to={routes.insight(insight.id)} className={styles.title}>
        {insight.title}
      </Link>
      <p className={styles.summary}>{insight.summary}</p>
      {insight.effects.length > 0 && (
        <ul className={styles.effects}>
          {insight.effects.map((effect) => (
            <li key={effect.metric}>
              {metricLabels[effect.metric]}: <b>{formatPercent(effect.change)}</b>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
