import type { ReactNode } from 'react'
import type { InsightIconKind, InsightTone } from '../model/types'
import { InsightIcon } from './InsightIcon'
import styles from './InsightCard.module.css'

interface InsightCardProps {
  icon: InsightIconKind
  tone: InsightTone
  label: string
  time: string
  title: string
  summary: string
  tag?: { text: string; tone: InsightTone }
  sources?: string
  status?: string
  actions?: ReactNode
}

export function InsightCard({
  icon,
  tone,
  label,
  time,
  title,
  summary,
  tag,
  sources,
  status,
  actions,
}: InsightCardProps) {
  return (
    <article className={styles.card}>
      <InsightIcon kind={icon} />
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.label} data-tone={tone}>
            {label}
          </span>
          <span>{time}</span>
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.summary}>{summary}</p>
        <div className={styles.footer}>
          {tag && (
            <span className={styles.tag} data-tone={tag.tone}>
              {tag.text}
            </span>
          )}
          {sources && <span className={styles.sources}>{sources}</span>}
          {status && <span className={styles.status}>· {status}</span>}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      </div>
    </article>
  )
}
