import { useState } from 'react'
import { InsightCard, useInsights, type InsightImpact } from '@/entities/insight'
import { ImpactFilter } from '@/features/filter-insights'
import { Spinner } from '@/shared/ui'
import styles from './InsightFeed.module.css'

export function InsightFeed() {
  const [impact, setImpact] = useState<InsightImpact | undefined>()
  const { data: insights, isPending, isError } = useInsights({ impact })

  return (
    <section className={styles.feed}>
      <ImpactFilter value={impact} onChange={setImpact} />
      {isPending && <Spinner />}
      {isError && <p className={styles.state}>Не удалось загрузить инсайты</p>}
      {insights?.length === 0 && <p className={styles.state}>Пока ничего нет</p>}
      <div className={styles.list}>
        {insights?.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </section>
  )
}
