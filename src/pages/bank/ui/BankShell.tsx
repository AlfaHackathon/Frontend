import { useState, type ReactNode, type Ref } from 'react'
import { useLocation } from 'react-router'
import { routes } from '@/shared/config'
import { BankHeader } from '@/widgets/bank-header'
import { BankSidebar } from '@/widgets/bank-sidebar'
import styles from './BankShell.module.css'

export function BankShell({ children, briefingRef }: { children: ReactNode; briefingRef?: Ref<HTMLAnchorElement> }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const chatActive = location.pathname === routes.chat || location.pathname.startsWith(`${routes.chat}/`)
  const briefingActive = location.pathname === routes.briefing || chatActive

  return <div className={`${styles.shell} ${briefingActive ? styles.briefingShell : ''}`}>
    <BankHeader onMenuClick={() => setMenuOpen(true)} />
    <div className={styles.body}>
      <BankSidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} briefingRef={briefingRef} />
      {menuOpen && <div className={styles.backdrop} onClick={() => setMenuOpen(false)} />}
      <main className={`${styles.content} ${briefingActive ? '' : styles.bankContent} ${chatActive ? styles.chatContent : ''}`}>{children}</main>
    </div>
  </div>
}
