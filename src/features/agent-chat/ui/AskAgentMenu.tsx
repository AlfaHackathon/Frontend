import { useEffect, useRef, useState } from 'react'
import { SparkIcon } from '@/shared/ui/icons'
import styles from './AskAgentMenu.module.css'

interface AskAgentMenuProps {
  questions: string[]
  onAsk?: (question: string) => void
}

export function AskAgentMenu({ questions, onAsk }: AskAgentMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const ask = (question: string) => {
    setOpen(false)
    onAsk?.(question)
  }

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        type="button"
        className={styles.trigger}
        aria-label="Спросить агента"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <SparkIcon />
      </button>
      {open && (
        <div className={styles.menu}>
          <div className={styles.caption}>Спросить агента про этот инсайт</div>
          {questions.map((question) => (
            <button
              key={question}
              type="button"
              className={styles.item}
              onClick={() => ask(question)}
            >
              <SparkIcon className={styles.itemIcon} />
              {question}
            </button>
          ))}
          <button type="button" className={styles.item} data-muted onClick={() => ask('')}>
            <SparkIcon className={styles.itemIcon} />
            Свой вопрос…
          </button>
        </div>
      )}
    </div>
  )
}
