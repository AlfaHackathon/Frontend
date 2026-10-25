import { Link } from 'react-router'
import { routes } from '@/shared/config'
import { BankShell } from '@/pages/bank/ui/BankShell'
import { BankIcon } from '@/pages/bank/ui/BankIcon'
import styles from './BriefingHomePage.module.css'

const insights = [
  { category: 'Расходы', time: '12:40', title: 'Топливо может обойтись дороже', impact: 'Давление на маржу', color: '#e94340' },
  { category: 'Финансы', time: '12:15', title: 'Новые условия финансирования', impact: 'Возможность снизить расходы', color: '#519075' },
  { category: 'Продажи', time: '11:50', title: 'Спрос меняется по регионам', impact: 'Пересмотрите план отгрузок', color: '#607eb6' },
  { category: 'Поставщики', time: '11:20', title: 'Пересмотрите условия поставок', impact: 'Проверьте контрагентов', color: '#b5854b' },
  { category: 'Логистика', time: '10:45', title: 'Проверьте маршруты поставок', impact: 'Риск увеличения сроков', color: '#7d76b2' },
]

export function BriefingHomePage() {
  return <BankShell>
    <section className={styles.hero}>
      <time>Пятница, 23 октября</time>
      <h1>Здравствуйте, Алексей</h1>
      <p>Выберите, с чего начнём сегодня.</p>
    </section>

    <div className={styles.actions}>
      <Link to={routes.chat} className={styles.action}><span className={styles.actionIcon}><BankIcon name="bot" /></span><span>Спросить Агента</span></Link>
      <Link to={routes.insights} className={styles.action}><span className={styles.actionIcon}><BankIcon name="grid" /></span><span>Инсайты</span></Link>
      <Link to={routes.feed} className={styles.action}><span className={styles.actionIcon}><BankIcon name="news" /></span><span>Новости</span></Link>
    </div>

    <section className={styles.insightsSection}>
      <div className={styles.sectionHeading}><h2>Последние инсайты</h2><span>5 последних по времени события</span></div>
      <div className={styles.insightGrid}>
        {insights.map((insight) => <Link className={styles.insight} to={routes.insights} key={insight.title}>
          <div className={styles.insightMeta}><span style={{ color: insight.color }}><i style={{ background: insight.color }} />{insight.category}</span><time>{insight.time}</time></div>
          <h3>{insight.title}</h3>
          <p>{insight.impact}</p>
          <div className={styles.insightBottom}>Подробнее <BankIcon name="chevronRight" /></div>
        </Link>)}
        <Link className={styles.allInsights} to={routes.insights}><span>•••</span><strong>Все<br />инсайты</strong><span className={styles.allArrow}>→</span></Link>
      </div>
    </section>

    <section className={styles.resume}>
      <div className={styles.resumeIcon}><BankIcon name="percent" /></div>
      <div className={styles.resumeText}><small>ПРОДОЛЖИТЬ ИССЛЕДОВАНИЕ</small><h2>Влияние ключевой ставки на стоимость финансирования</h2><p>Вы изучали этот вопрос вчера. Анализ сохранён.</p></div>
      <Link to={routes.chat} className={styles.resumeButton}>Продолжить анализ <span>→</span></Link>
    </section>
    <p className={styles.disclaimer}>Демонстрационные данные · События, показатели и история приведены для макета</p>
  </BankShell>
}
