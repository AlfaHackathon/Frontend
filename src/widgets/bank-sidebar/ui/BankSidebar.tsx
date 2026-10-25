import { ArrowsRightLeftCurvedBoldMIcon } from '@alfalab/icons-glyph/ArrowsRightLeftCurvedBoldMIcon'
import { CalculatorMIcon } from '@alfalab/icons-glyph/CalculatorMIcon'
import { CardMIcon } from '@alfalab/icons-glyph/CardMIcon'
import { ChevronDownMIcon } from '@alfalab/icons-glyph/ChevronDownMIcon'
import { DocumentArrowRightMIcon } from '@alfalab/icons-glyph/DocumentArrowRightMIcon'
import { DocumentsLinesMIcon } from '@alfalab/icons-glyph/DocumentsLinesMIcon'
import { DocumentStampMIcon } from '@alfalab/icons-glyph/DocumentStampMIcon'
import { EagleMIcon } from '@alfalab/icons-glyph/EagleMIcon'
import { NavigationNewsMIcon } from '@alfalab/icons-glyph/NavigationNewsMIcon'
import { PlusCircleMIcon } from '@alfalab/icons-glyph/PlusCircleMIcon'
import { PlusMIcon } from '@alfalab/icons-glyph/PlusMIcon'
import { UsersGroupMIcon } from '@alfalab/icons-glyph/UsersGroupMIcon'
import { WalletMIcon } from '@alfalab/icons-glyph/WalletMIcon'
import { useState, type ComponentType, type SVGProps } from 'react'
import { NavLink, useLocation } from 'react-router'
import { routes } from '@/shared/config'
import { cn } from '@/shared/lib'
import { AccountsMIcon } from '@/shared/ui/icons'
import styles from './BankSidebar.module.css'

interface MenuItem {
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  to?: string
  dark?: boolean
}

const bankItems: MenuItem[] = [
  { label: 'Новый платёж', icon: PlusCircleMIcon, dark: true },
  { label: 'Платежи в работе', icon: ArrowsRightLeftCurvedBoldMIcon },
  { label: 'Импорт платежей', icon: DocumentsLinesMIcon },
  { label: 'Выписка', icon: DocumentStampMIcon },
  { label: 'Счета', icon: AccountsMIcon },
  { label: 'Контрагенты', icon: UsersGroupMIcon },
]

const briefingItems = [
  { label: 'Спросить агента', to: routes.agent },
  { label: 'Инсайты', to: routes.feed },
  { label: 'Новости', to: routes.news },
]

const serviceItems: MenuItem[] = [
  { label: 'Эквайринг и касса', icon: CalculatorMIcon },
  { label: 'Зарплатный проект', icon: WalletMIcon },
  { label: 'Карты', icon: CardMIcon },
  { label: 'Документооборот', icon: DocumentArrowRightMIcon },
]

function MenuLink({ item }: { item: MenuItem }) {
  const ItemIcon = item.icon
  const content = (
    <>
      <ItemIcon className={cn(styles.icon, item.dark && styles.iconDark)} />
      <span>{item.label}</span>
    </>
  )

  if (!item.to) {
    return (
      <button type="button" className={styles.item}>
        {content}
      </button>
    )
  }

  return (
    <NavLink to={item.to} className={({ isActive }) => cn(styles.item, isActive && styles.active)}>
      {content}
    </NavLink>
  )
}

function BriefingMenu() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(pathname.startsWith(routes.home))

  return (
    <div>
      <div className={styles.group}>
        <NavLink
          to={routes.home}
          end
          className={({ isActive }) => cn(styles.item, isActive && styles.active)}
        >
          <NavigationNewsMIcon className={styles.icon} />
          <span>Брифинг</span>
        </NavLink>
        <button
          type="button"
          className={cn(styles.toggle, open && styles.toggleOpen)}
          aria-label={open ? 'Свернуть' : 'Развернуть'}
          onClick={(event) => {
            event.stopPropagation()
            setOpen(!open)
          }}
        >
          <ChevronDownMIcon width={20} height={20} />
        </button>
      </div>
      {open && (
        <div className={styles.submenu}>
          {briefingItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(styles.subitem, isActive && styles.subActive)}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

interface BankSidebarProps {
  open?: boolean
  onNavigate?: () => void
}

export function BankSidebar({ open = false, onNavigate }: BankSidebarProps) {
  return (
    <aside className={cn(styles.sidebar, open && styles.open)} onClick={onNavigate}>
      <nav className={styles.menu}>
        {bankItems.map((item) => (
          <MenuLink key={item.label} item={item} />
        ))}

        <div className={styles.section}>
          <span>Мои сервисы</span>
          <PlusMIcon width={18} height={18} />
        </div>
        <BriefingMenu />
        {serviceItems.map((item) => (
          <MenuLink key={item.label} item={item} />
        ))}

        <div className={styles.divider} />
        <MenuLink item={{ label: 'Госзакупки', icon: EagleMIcon }} />
      </nav>
    </aside>
  )
}
