import { impactLabels, type InsightImpact } from '@/entities/insight'
import { cn } from '@/shared/lib'
import styles from './ImpactFilter.module.css'

interface ImpactFilterProps {
  value: InsightImpact | undefined
  onChange: (value: InsightImpact | undefined) => void
}

const options: Array<{ value: InsightImpact | undefined; label: string }> = [
  { value: undefined, label: 'Все' },
  { value: 'negative', label: impactLabels.negative },
  { value: 'positive', label: impactLabels.positive },
  { value: 'neutral', label: impactLabels.neutral },
]

export function ImpactFilter({ value, onChange }: ImpactFilterProps) {
  return (
    <div className={styles.filter} role="radiogroup" aria-label="Тип инсайта">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={cn(styles.chip, value === option.value && styles.active)}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
