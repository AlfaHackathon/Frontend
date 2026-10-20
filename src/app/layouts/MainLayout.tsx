import { Outlet } from 'react-router'
import { Header } from '@/widgets/header'
import styles from './MainLayout.module.css'

export function MainLayout() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
    </>
  )
}
