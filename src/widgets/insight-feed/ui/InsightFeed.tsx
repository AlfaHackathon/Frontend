import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  categoryLabels,
  InsightCard,
  useInsights,
  type InsightCategory,
} from '@/entities/insight'
import { InsightFilter, type FilterTab } from '@/features/filter-insights'
import { routes } from '@/shared/config'
import { Button } from '@/shared/ui'
import styles from './InsightFeed.module.css'

type Tab = InsightCategory | 'all'

export function InsightFeed() {
  const navigate = useNavigate()
  const [category, setCategory] = useState<Tab>('all')
  const { data: insights = [], isPending, isError, refetch } = useInsights()

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
      {isPending && <p role="status" className={styles.state}>Загружаем инсайты…</p>}
      {isError && <div role="alert" className={styles.state}>Не удалось загрузить инсайты. <button type="button" onClick={() => void refetch()}>Повторить</button></div>}
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
              <Button className={styles.more} onClick={() => navigate(routes.insight(item.id))}>
                Подробнее
              </Button>
            }
          />
        ))}
      </div>
    </section>
  )
}
