import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  categoryLabels,
  InsightCard,
  sortInsights,
  useInfiniteInsights,
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
  const personal = useInfiniteInsights('personal')
  const general = useInfiniteInsights('general')
  const insights = sortInsights([
    ...(personal.data?.pages.flatMap((page) => page.items) ?? []),
    ...(general.data?.pages.flatMap((page) => page.items) ?? []),
  ])
  const isPending = personal.isPending || general.isPending
  const isError = personal.isError || general.isError
  const hasNextPage = personal.hasNextPage || general.hasNextPage
  const isFetchingNextPage = personal.isFetchingNextPage || general.isFetchingNextPage

  function loadMore() {
    void Promise.all([
      personal.hasNextPage ? personal.fetchNextPage() : Promise.resolve(),
      general.hasNextPage ? general.fetchNextPage() : Promise.resolve(),
    ])
  }

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
      {isError && <div role="alert" className={styles.state}>Не удалось загрузить часть инсайтов. <button type="button" onClick={() => { void Promise.all([personal.refetch(), general.refetch()]) }}>Повторить</button></div>}
      {!isPending && !isError && items.length === 0 && <p className={styles.state}>{hasNextPage ? 'В загруженной части нет подходящих инсайтов. Загрузите ещё.' : category === 'all' ? 'Для вашей компании пока нет инсайтов.' : 'В этой категории пока нет инсайтов.'}</p>}
      <div className={styles.list}>
        {items.map((item) => (
          <InsightCard
            key={`${item.kind ?? 'personal'}:${item.id}`}
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
              <Button className={styles.more} onClick={() => navigate(routes.insight(item.id, item.kind))}>
                Подробнее
              </Button>
            }
          />
        ))}
      </div>
      {hasNextPage && <Button variant="secondary" className={styles.loadMore} onClick={loadMore} disabled={isFetchingNextPage}>{isFetchingNextPage ? 'Загружаем…' : 'Показать ещё'}</Button>}
    </section>
  )
}
