import { InsightFeed } from '@/widgets/insight-feed'

export function FeedPage() {
  return (
    <>
      <h1 className="page-title">Лента инсайтов</h1>
      <p className="page-subtitle">События рынка и их влияние на вашу компанию</p>
      <InsightFeed />
    </>
  )
}
