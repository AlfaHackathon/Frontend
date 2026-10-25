import { useLayoutEffect, useState, type RefObject } from 'react'
import styles from './BankOnboarding.module.css'

interface Position {
  spot: { top: number; left: number; width: number; height: number } | null
  tip: { top: number; left: number }
  placement: 'right' | 'center'
}

const TIP_WIDTH = 408
const TIP_HEIGHT = 224
const SPOT_PADDING = 8

export function BankOnboarding({
  targetRef,
  onDismiss,
  onTry,
}: {
  targetRef: RefObject<HTMLAnchorElement | null>
  onDismiss: () => void
  onTry: () => void
}) {
  const [position, setPosition] = useState<Position | null>(null)

  useLayoutEffect(() => {
    const measure = () => {
      const target = targetRef.current
      if (!target) return

      const rect = target.getBoundingClientRect()
      if (window.innerWidth <= 760 || rect.height === 0) {
        setPosition({ spot: null, tip: {
          left: Math.max(12, (window.innerWidth - TIP_WIDTH) / 2),
          top: Math.max(12, (window.innerHeight - TIP_HEIGHT) / 2),
        }, placement: 'center' })
        return
      }

      const left = rect.right + 32
      setPosition({
        spot: {
          top: rect.top - SPOT_PADDING,
          left: rect.left - SPOT_PADDING,
          width: rect.width + SPOT_PADDING * 2,
          height: rect.height + SPOT_PADDING * 2,
        },
        tip: {
          left: Math.min(left, window.innerWidth - TIP_WIDTH - 12),
          top: Math.max(12, Math.min(rect.top + rect.height / 2 - TIP_HEIGHT / 2, window.innerHeight - TIP_HEIGHT - 12)),
        },
        placement: 'right',
      })
    }

    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [targetRef])

  if (!position) return null

  return <div className={styles.host}>
    <div className={styles.catch} onClick={onDismiss} aria-hidden="true" />
    {position.spot && <div className={styles.spot} style={position.spot} aria-hidden="true" />}
    <div
      className={styles.tip}
      data-placement={position.placement}
      style={position.tip}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bank-onboarding-title"
      onKeyDown={(event) => { if (event.key === 'Escape') onDismiss() }}
    >
      <button className={styles.close} type="button" aria-label="Закрыть" onClick={onDismiss}>×</button>
      <h2 id="bank-onboarding-title">У нас новая функция</h2>
      <p>Брифинг подбирает новости<br />и события, важные вашему бизнесу.</p>
      <div className={styles.actions}>
        <button className={styles.later} type="button" onClick={onDismiss}>Позже</button>
        <button className={styles.try} type="button" onClick={onTry}>Попробовать</button>
      </div>
    </div>
  </div>
}
