import { useState } from 'react'
import { InsightCard } from '@/entities/insight'
import { AskAgentMenu } from '@/features/agent-chat'
import { InsightFilter, type FilterTab } from '@/features/filter-insights'
import { Button } from '@/shared/ui'
import { feedItems, type FeedCategory } from '../model/data'
import styles from './InsightFeed.module.css'

const labels: Record<FeedCategory, string> = {
  all: 'Все',
  risks: 'Риски',
  opportunities: 'Возможности',
  events: 'События',
  peers: 'Похожие компании',
}

const tabs: FilterTab<FeedCategory>[] = (Object.keys(labels) as FeedCategory[]).map((value) => ({
  value,
  label: labels[value],
  count:
    value === 'all' ? feedItems.length : feedItems.filter((item) => item.category === value).length,
}))

const pending = feedItems.filter((item) => item.status === 'Ждёт вашего решения').length

export function InsightFeed() {
  const [category, setCategory] = useState<FeedCategory>('all')
  const items =
    category === 'all' ? feedItems : feedItems.filter((item) => item.category === category)

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
