import { useState } from 'react'
import {
  categoryLabels,
  InsightCard,
  useInsights,
  type InsightCategory,
} from '@/entities/insight'
import { AskAgentMenu } from '@/features/agent-chat'
import { InsightFilter, type FilterTab } from '@/features/filter-insights'
import { Button } from '@/shared/ui'
import styles from './InsightFeed.module.css'

type Tab = InsightCategory | 'all'

export function InsightFeed() {
  const [category, setCategory] = useState<Tab>('all')
  const { data: insights = [] } = useInsights()

  const tabs: FilterTab<Tab>[] = [
    { value: 'all', label: 'Все', count: insights.length },
    ...(Object.keys(categoryLabels) as InsightCategory[]).map((value) => ({
      value,
      label: categoryLabels[value],
      count: insights.filter((item) => item.category === value).length,
    })),
  ]
  const pending = insights.filter((item) => item.pending).length
  const items =
    category === 'all' ? insights : insights.filter((item) => item.category === category)

  return (
    <section className={styles.feed}>
      <InsightFilter tabs={tabs} value={category} onChange={setCategory} pending={pending} />
      <div className={styles.list}>
        {items.map((item) => (
          <InsightCard
            key={item.id}
            icon={item.icon}
            tone={item.tone}
            label={item.label}
            time={item.time}
            title={item.title}
            summary={item.summary}
            tag={item.tag}
            sources={item.sources}
            status={item.status}
            actions={
              <div className={styles.split}>
                <Button className={styles.more}>Подробнее</Button>
                <AskAgentMenu questions={item.questions} />
              </div>
            }
          />
        ))}
      </div>
    </section>
  )
}
