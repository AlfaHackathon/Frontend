import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useFlueAgent } from '@flue/react'
import { createFlueClient } from '@flue/sdk'
import { ArrowRight, Bot, X } from 'lucide-react'
import { chatApi } from '@/entities/chat'
import type { InsightDetails } from '@/entities/insight'
import { env } from '@/shared/config'
import styles from './InsightAssistant.module.css'

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'status' in error) {
    if (error.status === 401 || error.status === 403) return 'Нет доступа к помощнику. Проверьте вход в аккаунт.'
    return `Ошибка сервиса: ${error.status}. Попробуйте ещё раз.`
  }
  return 'Не удалось связаться с помощником. Попробуйте ещё раз.'
}

function firstQuestion(insight: InsightDetails, question: string): string {
  return [
    `Обсуждаем сохранённый инсайт «${insight.title}» (${insight.kind ?? 'personal'}, ID ${insight.id}).`,
    insight.newsMaterialId ? `ID новости: ${insight.newsMaterialId}.` : '',
    insight.revisionCreatedAt ? `Время сохранённой ревизии: ${insight.revisionCreatedAt}.` : '',
    insight.summary ? `Текст на карточке: ${insight.summary}` : '',
    insight.analysis ? `Сохранённый вывод: ${insight.analysis}` : '',
    insight.importance?.score != null ? `Важность для компании: ${insight.importance.score} из 5. ${insight.importance.rationale}` : '',
    ...(insight.indicators ?? []).map((indicator) => `Сохранённый показатель: ${indicator.value} ${indicator.unit ?? ''}; период ${indicator.period ?? 'не указан'}.`),
    insight.sourceDetails?.length ? `Источники карточки: ${insight.sourceDetails.map((source) => source.title).join(', ')}` : '',
    'Сверь ответ с доступными сохранёнными эффектами и источниками. Если точную карточку подтвердить не удаётся, скажи об этом. Не запускай новый анализ без отдельной явной просьбы.',
    `Вопрос: ${question}`,
  ].filter(Boolean).join('\n\n')
}

function Conversation({ insight, token, chatId, onRefresh }: {
  insight: InsightDetails; token: string; chatId: string; onRefresh: () => void
}) {
  const [question, setQuestion] = useState('')
  const [error, setError] = useState('')
  const retry = useRef<{ question: string; input: string; key: string } | null>(null)
  const wasBusy = useRef(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const client = useMemo(() => createFlueClient({ url: `${env.agentServiceUrl}/agents/assistant/${encodeURIComponent(chatId)}`, token }), [chatId, token])
  const agent = useFlueAgent({ client })
  const chat = useQuery({ queryKey: ['chat', chatId, token], queryFn: () => chatApi.get(chatId, token), retry: false })
  const busy = agent.status === 'submitted' || agent.status === 'streaming'
  const messages = agent.messages.filter((message) => message.display === 'visible' && (message.role === 'user' || message.role === 'assistant'))
  const suggestions = insight.questions.length > 0 ? insight.questions.slice(0, 2) : ['Объясни этот вывод простыми словами', 'Какие источники подтверждают вывод?']

  useEffect(() => { bottomRef.current?.scrollIntoView({ block: 'end' }) }, [agent.messages])
  useEffect(() => {
    if (wasBusy.current && !busy) onRefresh()
    wasBusy.current = busy
  }, [busy, onRefresh])

  async function ask(value: string) {
    const trimmed = value.trim()
    if (!trimmed || busy || !agent.historyReady || !chat.data || chat.data.archivedAt) return
    const input = retry.current?.question === trimmed ? retry.current.input : messages.length === 0 ? firstQuestion(insight, trimmed) : trimmed
    if (input.length > 32000) { setError('Вопрос слишком длинный. Сократите его.'); return }
    const key = retry.current?.question === trimmed ? retry.current.key : crypto.randomUUID()
    retry.current = { question: trimmed, input, key }
    setQuestion('')
    setError('')
    try {
      await agent.sendMessage(input, { idempotencyKey: key })
      retry.current = null
      onRefresh()
    } catch (cause) {
      setQuestion(trimmed)
      setError(errorMessage(cause))
    }
  }

  return <>
    <div className={styles.content}>
      <p className={styles.context}>Инсайт: {insight.title}</p>
      <div className={styles.suggestions}>{suggestions.map((suggestion) => <button key={suggestion} type="button" disabled={!agent.historyReady || !chat.data || Boolean(chat.data.archivedAt) || busy} onClick={() => void ask(suggestion)}>{suggestion}</button>)}</div>
      <div className={styles.messages} aria-live="polite" aria-label="Сообщения помощника">
        {!agent.historyReady && <p className={styles.notice}>Загружаем диалог…</p>}
        {messages.map((message) => <div className={styles.message} data-role={message.role} key={message.id}>{message.parts.filter((part) => part.type === 'text').map((part) => part.text).join('') || (message.role === 'assistant' ? 'Думаю…' : '')}</div>)}
        {busy && messages.at(-1)?.role !== 'assistant' && <p className={styles.notice}>Помощник готовит ответ…</p>}
        <div ref={bottomRef} />
      </div>
    </div>
    {chat.data?.archivedAt && <p className={styles.error}>Этот диалог в архиве. Восстановите его в разделе «Диалоги».</p>}
    {(chat.isError || agent.error) && <p role="alert" className={styles.error}>{errorMessage(chat.error ?? agent.error)}</p>}
    <form className={styles.composer} onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void ask(question) }}>
      <div><input aria-label="Уточняющий вопрос" value={question} maxLength={32000} onChange={(event) => setQuestion(event.target.value)} placeholder="Задайте уточняющий вопрос…" disabled={!agent.historyReady || !chat.data || Boolean(chat.data.archivedAt) || busy} /><button type="submit" aria-label="Отправить вопрос" disabled={!question.trim() || !agent.historyReady || !chat.data || Boolean(chat.data.archivedAt) || busy}><ArrowRight size={22} /></button></div>
      {busy && <button className={styles.stop} type="button" onClick={() => void client.abort()}>Остановить ответ</button>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <small>Ответ помощника проверяйте по сохранённому разбору и источникам.</small>
    </form>
  </>
}

export function InsightAssistant({ insight, token, userId, onClose, onRefresh }: {
  insight: InsightDetails; token: string; userId: string; onClose: () => void; onRefresh: () => void
}) {
  const storageKey = `alfa-briefing:insight-chat:${userId}:${insight.kind ?? 'personal'}:${insight.id}:${insight.revisionCreatedAt ?? 'current'}`
  const chat = useQuery({
    queryKey: ['insight-chat', storageKey, token],
    enabled: Boolean(token),
    retry: false,
    queryFn: async () => {
      const saved = sessionStorage.getItem(storageKey)
      if (saved) {
        try { return await chatApi.get(saved, token) }
        catch (error) {
          if (!error || typeof error !== 'object' || !('status' in error) || error.status !== 404) throw error
          sessionStorage.removeItem(storageKey)
        }
      }
      const created = await chatApi.create(token, `Инсайт: ${insight.title}`.slice(0, 200))
      sessionStorage.setItem(storageKey, created.id)
      return created
    },
  })

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return <div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <aside className={styles.panel} aria-label="Помощник по инсайту" aria-modal="true" role="dialog">
      <header><div><h2><Bot size={22} />Помощник по инсайту</h2><p>Уточнения по готовому разбору</p></div><button type="button" aria-label="Закрыть помощника" onClick={onClose}><X size={22} /></button></header>
      {!token ? <div className={styles.empty}><p>Для помощника нужен вход в аккаунт.</p></div>
        : chat.isPending ? <div className={styles.empty} role="status"><p>Открываем диалог…</p></div>
          : chat.isError ? <div className={styles.empty} role="alert"><p>{errorMessage(chat.error)}</p><button type="button" onClick={() => void chat.refetch()}>Повторить</button></div>
            : <Conversation insight={insight} token={token} chatId={chat.data.id} onRefresh={onRefresh} />}
    </aside>
  </div>
}
