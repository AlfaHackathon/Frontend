import { useEffect, useState, type FormEvent } from 'react'
import { ArrowRight, Bot, X } from 'lucide-react'
import type { Insight } from '@/entities/insight'
import styles from './InsightAssistant.module.css'

export interface InsightAssistantTransport {
  ask: (input: { insightId: string; question: string }) => Promise<string>
}

interface Message { role: 'user' | 'assistant'; text: string }

export function InsightAssistant({ insight, transport, onClose }: { insight: Insight; transport?: InsightAssistantTransport; onClose: () => void }) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  async function ask(value: string) {
    const trimmed = value.trim()
    if (!transport || !trimmed || busy) return
    setQuestion('')
    setError('')
    setMessages((items) => [...items, { role: 'user', text: trimmed }])
    setBusy(true)
    try {
      const answer = await transport.ask({ insightId: insight.id, question: trimmed })
      setMessages((items) => [...items, { role: 'assistant', text: answer }])
    } catch {
      setMessages((items) => items.slice(0, -1))
      setError('Не удалось получить ответ. Попробуйте ещё раз.')
      setQuestion(trimmed)
    } finally {
      setBusy(false)
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void ask(question) }

  return <div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <aside className={styles.panel} aria-label="Помощник по инсайту" aria-modal="true" role="dialog">
      <header><div><h2><Bot size={22} />Помощник по инсайту</h2><p>Уточнения по готовому разбору</p></div><button type="button" aria-label="Закрыть помощника" onClick={onClose}><X size={22} /></button></header>
      <div className={styles.content}>
        <p className={styles.context}>Инсайт: {insight.title}</p>
        <div className={styles.suggestions}>{insight.questions.slice(0, 2).map((suggestion) => <button key={suggestion} type="button" disabled={!transport} onClick={() => void ask(suggestion)}>{suggestion}</button>)}</div>
        {transport ? <div className={styles.messages} aria-live="polite">{messages.map((message, index) => <div className={styles.message} data-role={message.role} key={`${index}-${message.role}`}>{message.text}</div>)}{busy && <p>Помощник готовит ответ…</p>}</div> : <div className={styles.empty}><Bot size={32} /><h3>Помощник появится здесь</h3><p>Разбор уже доступен на странице. Позже здесь можно будет задавать уточняющие вопросы по этому инсайту.</p></div>}
      </div>
      <form className={styles.composer} onSubmit={submit}><div><input aria-label="Уточняющий вопрос" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={transport ? 'Задайте уточняющий вопрос…' : 'Вопросы станут доступны позже'} disabled={!transport || busy} /><button type="submit" aria-label="Отправить вопрос" disabled={!transport || !question.trim() || busy}><ArrowRight size={22} /></button></div>{error && <p role="alert" className={styles.error}>{error}</p>}<small>{transport ? 'Ответы основаны на данных, доступных помощнику' : 'Подключение помощника готовится'}</small></form>
    </aside>
  </div>
}
