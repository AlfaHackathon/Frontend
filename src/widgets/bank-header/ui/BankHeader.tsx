import { BriefcaseGearMIcon } from '@alfalab/icons-glyph/BriefcaseGearMIcon'
import { BurgerMIcon } from '@alfalab/icons-glyph/BurgerMIcon'
import { CalendarMIcon } from '@alfalab/icons-glyph/CalendarMIcon'
import { DoorOpenMIcon } from '@alfalab/icons-glyph/DoorOpenMIcon'
import { MagnifierMIcon } from '@alfalab/icons-glyph/MagnifierMIcon'
import { MailMIcon } from '@alfalab/icons-glyph/MailMIcon'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useMyCompany } from '@/entities/company'
import { sessionStore, useSession } from '@/entities/session'
import { getFullName, useUser } from '@/entities/user'
import { ApiError } from '@/shared/api'
import { MegaphoneMIcon } from '@/shared/ui/icons'
import { routes } from '@/shared/config'
import styles from './BankHeader.module.css'

interface BankHeaderProps {
  onMenuClick?: () => void
}

export function BankHeader({ onMenuClick }: BankHeaderProps) {
  const session = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const userQuery = useUser(session?.userId)
  const companyQuery = useMyCompany(!!session)
  const user = userQuery.data
  const company = companyQuery.data
  const companyName = company?.name ?? (companyQuery.error instanceof ApiError && companyQuery.error.status === 404
    ? 'Компания не привязана'
    : companyQuery.isError ? 'Компания недоступна' : '')
  const userName = user ? [getFullName(user), user.roleName].filter(Boolean).join(' · ')
    : userQuery.isError ? 'Профиль недоступен' : ''

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <button type="button" className={styles.menuButton} onClick={onMenuClick} aria-label="Меню">
          <BurgerMIcon />
        </button>
        <span className={styles.mark}>А</span>
        <span className={styles.name}>Альфа-Бизнес</span>
      </div>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <MagnifierMIcon />
          <input placeholder="Поиск" aria-label="Поиск" />
        </label>

        <div className={styles.divider} />

        <div className={styles.actions}>
          <button type="button" className={styles.iconButton} aria-label="Календарь">
            <CalendarMIcon />
          </button>
          <button type="button" className={styles.iconButton} aria-label="Письма">
            <MailMIcon />
          </button>
          <button type="button" className={styles.iconButton} aria-label="Новости">
            <MegaphoneMIcon />
          </button>
        </div>

        <div className={styles.divider} />

        <div className={styles.company}>
          <span className={styles.companyName}>{companyName}</span>
          <span className={styles.userName}>{userName}</span>
        </div>
        <button type="button" className={styles.iconButton} aria-label="Профиль компании">
          <BriefcaseGearMIcon />
        </button>

        <div className={styles.divider} />

        <button type="button" className={styles.iconButton} aria-label="Выйти" onClick={() => {
          sessionStore.clear()
          queryClient.clear()
          navigate(routes.login, { replace: true })
        }}>
          <DoorOpenMIcon />
        </button>
      </div>
    </header>
  )
}
