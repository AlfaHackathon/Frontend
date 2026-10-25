import { CalendarLineMIcon } from '@alfalab/icons-glyph/CalendarLineMIcon'
import { CardCardLineMIcon } from '@alfalab/icons-glyph/CardCardLineMIcon'
import { ChartLineAscMIcon } from '@alfalab/icons-glyph/ChartLineAscMIcon'
import { LockClosedLineMIcon } from '@alfalab/icons-glyph/LockClosedLineMIcon'
import type { ComponentType, SVGProps } from 'react'
import styles from './InsightIcon.module.css'

export type InsightIconKind = 'risk' | 'credit-risk' | 'rate' | 'growth' | 'price-lock'

function WarningIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M10.27 3.5a2 2 0 0 1 3.46 0l8 14A2 2 0 0 1 20 20.5H4a2 2 0 0 1-1.73-3l8-14ZM11 9v5h2V9h-2Zm0 6.5v2h2v-2h-2Z" />
    </svg>
  )
}

const config: Record<
  InsightIconKind,
  { icon: ComponentType<SVGProps<SVGSVGElement>>; tone: 'red' | 'blue' | 'green' }
> = {
  risk: { icon: WarningIcon, tone: 'red' },
  'credit-risk': { icon: CardCardLineMIcon, tone: 'red' },
  rate: { icon: CalendarLineMIcon, tone: 'blue' },
  growth: { icon: ChartLineAscMIcon, tone: 'green' },
  'price-lock': { icon: LockClosedLineMIcon, tone: 'green' },
}

export function InsightIcon({ kind }: { kind: InsightIconKind }) {
  const { icon: Icon, tone } = config[kind]
  return (
    <span className={styles.icon} data-tone={tone}>
      <Icon width={22} height={22} />
    </span>
  )
}
