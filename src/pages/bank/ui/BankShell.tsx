import type { ReactNode, Ref } from 'react'
import { Link, useLocation } from 'react-router'
import { routes } from '@/shared/config'
import { BankIcon } from './BankIcon'
import styles from './BankShell.module.css'

const upperLinks = [
  ['plusCircle', 'Новый платёж'], ['arrows', 'Платежи в работе'],
  ['import', 'Импорт платежей'], ['statement', 'Выписка'],
  ['accounts', 'Счета'], ['people', 'Контрагенты'],
] as const
const lowerLinks = [
  ['calculator', 'Эквайринг и касса'], ['wallet', 'Зарплатный проект'],
  ['cards', 'Карты'], ['documents', 'Документооборот'],
] as const

function MenuItem({ icon, label, active = false }: { icon: Parameters<typeof BankIcon>[0]['name']; label: string; active?: boolean }) {
  return <div className={`${styles.menuItem} ${active ? styles.menuActive : ''}`}><BankIcon name={icon} className={styles.menuIcon} />{label}</div>
}

export function BankShell({ children, briefingRef }: { children: ReactNode; briefingRef?: Ref<HTMLAnchorElement> }) {
  const location = useLocation()
  const chatActive = location.pathname === routes.chat || location.pathname.startsWith(`${routes.chat}/`)
  const briefingActive = location.pathname === routes.briefing || chatActive

  return <div className={`${styles.shell} ${briefingActive ? styles.briefingShell : ''} ${chatActive ? styles.chatShell : ''}`}>
    <aside className={styles.sidebar}>
      <Link className={styles.brand} to={routes.bank} aria-label="Альфа-Бизнес — главная">
        <span className={styles.brandMark}>А</span><span>Альфа-Бизнес</span>
      </Link>
      <nav className={styles.menu} aria-label="Навигация Альфа-Бизнеса">
        {upperLinks.map(([icon, label], index) => index === 0
          ? <Link className={`${styles.menuItem} ${!briefingActive ? styles.menuActive : ''}`} to={routes.bank} aria-current={!briefingActive ? 'page' : undefined} key={label}>
              <BankIcon name={icon} className={styles.menuIcon} />{label}
            </Link>
          : <MenuItem icon={icon} label={label} key={label} />)}
        <div className={styles.servicesTitle}>МОИ СЕРВИСЫ <span>＋</span></div>
        <Link ref={briefingRef} data-onboarding-id="briefing" className={`${styles.menuItem} ${briefingActive ? styles.menuActive : ''}`} to={routes.briefing}>
          <BankIcon name="briefing" className={styles.menuIcon} />Брифинг
        </Link>
        {lowerLinks.map(([icon, label]) => <MenuItem icon={icon} label={label} key={label} />)}
        <div className={styles.sidebarDivider} />
        <div className={styles.gov}><BankIcon name="crest" />Госзакупки</div>
        <div className={styles.menuTiles}>
          <div><BankIcon name="cart" className={styles.cartIcon} /><span>Все сервисы<br />и продукты</span></div>
          <div><span className={styles.cashbackIcon}>А</span><span>Кэшбэк<br />и привилегии</span></div>
        </div>
      </nav>
      <span className={styles.previous}>Предыдущая версия</span>
    </aside>
    <div className={styles.workspace}>
      <header className={styles.topbar}>
        <div className={styles.topbarTools}>
          <span className={styles.search}><BankIcon name="search" /><span>Поиск</span></span>
          <span className={styles.topIcon} aria-label="Календарь"><BankIcon name="calendar" /></span>
          <span className={styles.topIcon} aria-label="Почта"><BankIcon name="mail" /></span>
          <span className={styles.topIcon} aria-label="Уведомления"><BankIcon name="bell" /></span>
        </div>
        <div className={styles.profile}><strong>{briefingActive ? 'ГК «Апельсин»' : 'ООО «Город Наратино»'}</strong><small>{briefingActive ? 'Алексей · Руководитель' : 'Константинопольский К.К.'}</small></div>
        <span className={styles.topIcon} aria-label="Настройки"><BankIcon name="settings" /></span>
        <Link className={styles.exit} to={routes.login} aria-label="Выход"><BankIcon name="logout" /></Link>
      </header>
      <main className={`${styles.content} ${briefingActive ? '' : styles.bankContent} ${chatActive ? styles.chatContent : ''}`}>{children}</main>
    </div>
  </div>
}
