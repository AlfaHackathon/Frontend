import { ChevronDownMIcon } from '@alfalab/icons-glyph/ChevronDownMIcon'
import { PlusMIcon } from '@alfalab/icons-glyph/PlusMIcon'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { routes } from '@/shared/config'
import { BankShell } from './BankShell'
import { BankIcon } from './BankIcon'
import { BankOnboarding } from './BankOnboarding'
import styles from './BankPage.module.css'

const ONBOARDING_KEY = 'alfa-briefing:bank-onboarding-seen'

const quickActions = [
  ['template', 'Платёж по шаблону'],
  ['receipt', 'Сформировать\nвыписку'],
  ['oneC', 'Импорт платежей\nиз 1С'],
  ['invoice', 'Выставить счёт'],
  ['globe', 'Предоставить\nсведения о ВО'],
] as const

const paymentStatuses = [
  ['Оплатить', 1], ['Подписать', 7], ['Отправить', 7], ['Доработать', 4],
  ['Отклонённые', 7], ['Черновики', 5], ['В работе у банка', 8],
] as const

function shouldShowOnboarding() {
  try {
    return sessionStorage.getItem(ONBOARDING_KEY) !== '1'
  } catch {
    return true
  }
}

export function BankPage() {
  const navigate = useNavigate()
  const briefingRef = useRef<HTMLAnchorElement>(null)
  const preview = new URLSearchParams(window.location.search).has('onboarding_preview')
  const [showOnboarding, setShowOnboarding] = useState(() => preview || shouldShowOnboarding())

  useEffect(() => {
    if (!showOnboarding || preview) return
    try { sessionStorage.setItem(ONBOARDING_KEY, '1') } catch { /* Storage may be disabled. */ }
  }, [showOnboarding, preview])

  return (
    <BankShell briefingRef={briefingRef}>
      <div className={styles.actions}>
        {quickActions.map(([icon, label]) => <div className={styles.action} key={label}><span className={styles.actionIcon}><BankIcon name={icon} /></span><strong>{label}</strong></div>)}
        <div className={styles.actionControls}><span><PlusMIcon /></span><span><ChevronDownMIcon /></span></div>
      </div>

      <div className={styles.statuses}>{paymentStatuses.map(([label, count]) => <div key={label}>{label}<span>{count}</span></div>)}</div>

      <div className={styles.dashboardGrid}>
        <section className={styles.accountCard}>
          <div className={styles.accountTop}>
            <div className={styles.balance}>
              <h2>Рублёвый счёт <span>↗</span></h2>
              <p className={styles.amount}>207 590<span>,00 ₽</span></p>
              <p className={styles.accountNumber}>40802 810 2 99990 987672 <span>▪</span></p>
              <div className={styles.ownMoney}>Свои деньги: <strong>107 590,00 ₽</strong></div>
            </div>
            <div className={styles.credit}><small>КРЕДИТ ДЛЯ БИЗНЕСА</small><p><b>＋</b> 5 000 000 <em>₽</em></p><span>1,9% — на весь срок</span></div>
            <div className={styles.cardPreview}><div className={styles.miniCard}>А</div><div>Альфа-Бизнес<br /><span>··5123</span></div></div>
          </div>
          <div className={styles.accountBottom}><button type="button" onClick={() => navigator.clipboard?.writeText('40802810299990987672')}>Скопировать реквизиты</button><span>Тариф Удачный выбор</span></div>
        </section>
        <aside className={styles.offers}>
          <Link to={routes.briefing} className={`${styles.offer} ${styles.briefingOffer}`}><span><strong>Брифинг</strong><small>Важные события<br />для вашего бизнеса</small></span><span className={styles.briefingArt}><i /><b>✦</b></span></Link>
          <div className={`${styles.offer} ${styles.cardOffer}`}><span><strong>Закажите карту</strong><small>До 5% кэшбэк.<br />Карта будет доступна<br />уже через 60 секунд</small></span><span className={styles.bankCardArt}>А</span></div>
          <div className={`${styles.offer} ${styles.bonusOffer}`}><span><strong>Деньги сверху</strong><small>Получайте бонусные баллы<br />за привычные операции</small></span><span className={styles.bonusArt}>◉</span></div>
        </aside>
      </div>

      <section className={styles.history}>
        <h2>История операций <span>⌃</span></h2>
        <div className={styles.historySearch}><div className={styles.dateControl}><span>‹</span><strong>Сегодня</strong><span>›</span><BankIcon name="calendar" /></div><div className={styles.operationSearch}>Название контрагента, ИНН или КПП <BankIcon name="search" /></div></div>
        <div className={styles.filters}><span className={styles.filterSliders}><svg width="28" height="24" viewBox="0 0 28 24" fill="none" aria-hidden="true"><path d="M3 5h22M3 12h22M3 19h22" stroke="#222" strokeWidth="3" strokeLinecap="round"/><circle cx="10" cy="5" r="3.5" fill="#222"/><circle cx="18" cy="12" r="3.5" fill="#222"/><circle cx="10" cy="19" r="3.5" fill="#222"/></svg></span><span>Входящие</span><span>Исходящие</span><span>Тип платежа ﹀</span><span>Карта ﹀</span><span>Сумма ﹀</span><span className={styles.download}>Скачать ОСВ</span><button type="button">Скачать выписку</button></div>
        <div className={styles.totals}><div>Входящий остаток<strong>669 890,02 ₽</strong></div><div>Поступления<strong className={styles.positive}>+15 250,78 ₽</strong></div><div>Списания<strong>−5 990,24 ₽</strong></div><div>Исходящий остаток<strong>669 890,02 ₽</strong></div></div>
      </section>

      <div className={styles.chatBubble} aria-label="Чат"><BankIcon name="chat" /></div>

      {showOnboarding && <BankOnboarding
        targetRef={briefingRef}
        onDismiss={() => setShowOnboarding(false)}
        onTry={() => navigate(routes.briefing)}
      />}
    </BankShell>
  )
}
