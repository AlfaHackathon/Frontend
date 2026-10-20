import { useState, type FormEvent } from 'react'
import { Button, Card } from '@/shared/ui'
import { useAgentChat } from '../model/use-agent-chat'
import styles from './AgentChat.module.css'

interface AgentChatProps {
  insightId?: string
}

export function AgentChat({ insightId }: AgentChatProps) {
  const [context] = useState(() => ({ insightId }))
  const { messages, isStreaming, error, send, stop } = useAgentChat(context)
  const [draft, setDraft] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text || isStreaming) return
    setDraft('')
    void send(text)
  }

  return (
    <Card className={styles.chat}>
      <h3 className={styles.title}>Спросить ассистента</h3>
      <div className={styles.messages}>
        {messages.length === 0 && (
          <p className={styles.placeholder}>Например: «Как это повлияет на нашу маржу?»</p>
        )}
        {messages.map((message) => (
          <div key={message.id} className={styles.message} data-role={message.role}>
            {message.text || '…'}
          </div>
        ))}
        {error && <p className={styles.error}>{error}</p>}
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ваш вопрос"
          aria-label="Вопрос ассистенту"
        />
        {isStreaming ? (
          <Button variant="secondary" onClick={stop}>
            Стоп
          </Button>
        ) : (
          <Button type="submit" disabled={!draft.trim()}>
            Отправить
          </Button>
        )}
      </form>
    </Card>
  )
}
