import { ArrowsRightLeftCurvedBoldMIcon } from '@alfalab/icons-glyph/ArrowsRightLeftCurvedBoldMIcon'
import { CalculatorMIcon } from '@alfalab/icons-glyph/CalculatorMIcon'
import { CardMIcon } from '@alfalab/icons-glyph/CardMIcon'
import { DocumentArrowRightMIcon } from '@alfalab/icons-glyph/DocumentArrowRightMIcon'
import { DocumentsLinesMIcon } from '@alfalab/icons-glyph/DocumentsLinesMIcon'
import { DocumentStampMIcon } from '@alfalab/icons-glyph/DocumentStampMIcon'
import { EagleMIcon } from '@alfalab/icons-glyph/EagleMIcon'
import { NavigationNewsMIcon } from '@alfalab/icons-glyph/NavigationNewsMIcon'
import { PlusCircleMIcon } from '@alfalab/icons-glyph/PlusCircleMIcon'
import { PlusMIcon } from '@alfalab/icons-glyph/PlusMIcon'
import { UsersGroupMIcon } from '@alfalab/icons-glyph/UsersGroupMIcon'
import { WalletMIcon } from '@alfalab/icons-glyph/WalletMIcon'
import type { ComponentType, SVGProps } from 'react'
import { NavLink } from 'react-router'
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

const serviceItems: MenuItem[] = [
  { label: 'Брифинг', icon: NavigationNewsMIcon, to: routes.home },
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
        {serviceItems.map((item) => (
          <MenuLink key={item.label} item={item} />
        ))}

        <div className={styles.divider} />
        <MenuLink item={{ label: 'Госзакупки', icon: EagleMIcon }} />
      </nav>
    </aside>
  )
}
