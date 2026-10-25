import { cn } from '@/shared/lib'
import styles from './InsightFilter.module.css'

export interface FilterTab<T extends string> {
  value: T
  label: string
  count: number
}

interface InsightFilterProps<T extends string> {
  tabs: FilterTab<T>[]
  value: T
  onChange: (value: T) => void
  pending?: number
}

export function InsightFilter<T extends string>({
  tabs,
  value,
  onChange,
  pending,
}: InsightFilterProps<T>) {
  return (
    <div className={styles.bar}>
      <div className={styles.tabs} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={tab.value === value}
            className={cn(styles.tab, tab.value === value && styles.active)}
            onClick={() => onChange(tab.value)}
          >
            {tab.label}
            <span className={styles.count}>{tab.count}</span>
          </button>
        ))}
      </div>
      {pending !== undefined && (
        <button type="button" className={styles.pending}>
          Ждут решения
          <span className={styles.pendingCount}>{pending}</span>
        </button>
      )}
    </div>
  )
}
