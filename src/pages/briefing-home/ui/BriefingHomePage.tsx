import { Link } from 'react-router'
import { useInsights } from '@/entities/insight'
import { useSession } from '@/entities/session'
import { useUser } from '@/entities/user'
import { routes } from '@/shared/config'
import { BankShell } from '@/pages/bank/ui/BankShell'
import { BankIcon } from '@/pages/bank/ui/BankIcon'
import styles from './BriefingHomePage.module.css'

const dateFormatter = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
const toneColors = { red: '#e94340', green: '#519075', blue: '#607eb6' } as const

export function BriefingHomePage() {
  const session = useSession()
  const { data: user } = useUser(session?.userId)
  const { data: insights = [], isPending, isError, refetch } = useInsights()
  const latest = insights.slice(0, 5)

  return <BankShell>
    <section className={styles.hero}>
      <time>{dateFormatter.format(new Date())}</time>
      <h1>Здравствуйте{user?.firstName ? `, ${user.firstName}` : ''}</h1>
      <p>Выберите, с чего начнём сегодня.</p>
    </section>

    <div className={styles.actions}>
      <Link to={routes.chat} className={styles.action}><span className={styles.actionIcon}><BankIcon name="bot" /></span><span>Спросить Агента</span></Link>
      <Link to={routes.insights} className={styles.action}><span className={styles.actionIcon}><BankIcon name="grid" /></span><span>Инсайты</span></Link>
    </div>

    <section className={styles.insightsSection}>
      <div className={styles.sectionHeading}><h2>Последние инсайты</h2><span>Последние события для вашей компании</span></div>
      {isPending && <p className={styles.feedState} role="status">Загружаем инсайты…</p>}
      {isError && <p className={styles.feedState} role="alert">Не удалось загрузить инсайты. <button type="button" onClick={() => void refetch()}>Повторить</button></p>}
      {!isPending && !isError && latest.length === 0 && <p className={styles.feedState}>Для вашей компании пока нет инсайтов.</p>}
      <div className={styles.insightGrid}>
        {latest.map((insight) => <Link className={styles.insight} to={routes.insight(insight.id, insight.kind)} key={`${insight.kind ?? 'personal'}:${insight.id}`}>
          <div className={styles.insightMeta}><span style={{ color: toneColors[insight.tone] }}><i style={{ background: toneColors[insight.tone] }} />{insight.label}</span><time>{insight.time}</time></div>
          <h3>{insight.title}</h3>
          <p>{insight.summary}</p>
          <div className={styles.insightBottom}>Подробнее <BankIcon name="chevronRight" /></div>
        </Link>)}
        <Link className={styles.allInsights} to={routes.insights}><span>•••</span><strong>Все<br />инсайты</strong><span className={styles.allArrow}>→</span></Link>
      </div>
    </section>
  </BankShell>
}
