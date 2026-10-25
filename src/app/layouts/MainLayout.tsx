import { useState } from 'react'
import { Outlet } from 'react-router'
import { BankHeader } from '@/widgets/bank-header'
import { BankSidebar } from '@/widgets/bank-sidebar'
import styles from './MainLayout.module.css'

export function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className={styles.layout}>
      <BankHeader onMenuClick={() => setMenuOpen(true)} />
      <div className={styles.body}>
        <BankSidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
        {menuOpen && <div className={styles.backdrop} onClick={() => setMenuOpen(false)} />}
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
