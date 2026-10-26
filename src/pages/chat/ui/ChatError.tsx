import { useState } from 'react'
import { CircleAlert, X } from 'lucide-react'
import styles from './ChatPage.module.css'

export function ChatError({ message }: { message: string }) {
  const [hidden, setHidden] = useState<string | null>(null)
  if (hidden === message) return null

  return <div className={styles.error} role="alert">
    <CircleAlert size={20} strokeWidth={2} />
    <span>{message}</span>
    <button type="button" aria-label="Скрыть ошибку" onClick={() => setHidden(message)}><X size={16} strokeWidth={2} /></button>
  </div>
}
