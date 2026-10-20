import styles from './Logo.module.css'

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className={styles.logo} data-inverted={inverted}>
      <span className={styles.mark}>А</span>
      <span className={styles.name}>
        Альфа-<span className={styles.accent}>Брифинг</span>
      </span>
      <span className={styles.caption}>для бизнеса</span>
    </span>
  )
}
