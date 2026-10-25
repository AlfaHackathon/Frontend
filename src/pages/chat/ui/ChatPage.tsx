import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useFlueAgent } from '@flue/react'
import { createFlueClient } from '@flue/sdk'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowRight, ArrowUp, FileText, LayoutGrid, List, MessageSquareText, Sparkles } from 'lucide-react'
import { chatApi, type Chat } from '@/entities/chat'
import { BankShell } from '@/pages/bank/ui/BankShell'
import { BankIcon } from '@/pages/bank/ui/BankIcon'
import { env, routes } from '@/shared/config'
import styles from './ChatPage.module.css'

const TOKEN_KEY = 'alfa-briefing:agent-token'
const PENDING_KEY = 'alfa-briefing:pending-question'
const SEND_KEY_PREFIX = 'alfa-briefing:pending-send:'
const suggestions = [
  { title: 'Что изменилось за сутки?', detail: 'Главное для нашей компании', Icon: FileText },
  { title: 'Что происходит с закупками?', detail: 'Риски для стоимости топлива', Icon: Sparkles },
  { title: 'Разобрать последний инсайт', detail: 'Вывод и исходные новости', Icon: LayoutGrid },
] as const
interface PendingQuestion {
  chatId: string
  question: string
  idempotencyKey: string
}

function readPendingQuestion(): PendingQuestion | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(PENDING_KEY) ?? 'null') as Partial<PendingQuestion> | null
    return value && typeof value.chatId === 'string' && typeof value.question === 'string' && typeof value.idempotencyKey === 'string'
      ? value as PendingQuestion
      : null
  } catch {
    return null
  }
}

function idempotencyKeyFor(chatId: string, question: string): string {
  const storageKey = `${SEND_KEY_PREFIX}${chatId}`
  try {
    const previous = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null') as { question?: string; key?: string } | null
    if (previous?.question === question && previous.key) return previous.key
  } catch { /* A stale value is replaced below. */ }
  const key = crypto.randomUUID()
  sessionStorage.setItem(storageKey, JSON.stringify({ question, key }))
  return key
}

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'status' in error) {
    if (error.status === 401 || error.status === 403) return 'Нужен действующий JWT с доступом к AgentService.'
    return `Сервис вернул ошибку ${error.status}. Попробуйте ещё раз.`
  }
  return error instanceof Error ? error.message : 'Не удалось выполнить запрос.'
}

function isAuthError(error: unknown): boolean {
  return !!error && typeof error === 'object' && 'status' in error && (error.status === 401 || error.status === 403)
}

function chatTitle(chat: Chat) { return chat.title?.trim() || 'Новый диалог' }

function Composer({ value, setValue, send, busy = false, stop, disabled = false }: {
  value: string; setValue: (value: string) => void; send: () => void; busy?: boolean; stop?: () => void; disabled?: boolean
}) {
  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); if (!disabled && !busy && value.trim()) send() }
  }
  return <div className={styles.composerWrap}>
    <div className={styles.composer}>
      <textarea aria-label="Вопрос агенту" placeholder="Спросите, что это значит для вашего бизнеса" value={value} maxLength={32000}
        onChange={(event) => setValue(event.target.value)} onKeyDown={keyDown} disabled={disabled} />
      <div className={styles.composerActions}>
        {busy ? <button className={styles.send} type="button" aria-label="Остановить ответ" onClick={stop}>■</button>
          : <button className={styles.send} type="button" aria-label="Отправить вопрос" onClick={send} disabled={disabled || !value.trim()}><ArrowUp size={23} strokeWidth={2} /></button>}
      </div>
    </div>
    <p className={styles.composerHint}>Enter — отправить&nbsp;&nbsp; · &nbsp;&nbsp;Shift + Enter — новая строка</p>
  </div>
}

function Conversation({ id, token }: { id: string; token: string }) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const sentPending = useRef(false)
  const client = useMemo(() => createFlueClient({ url: `${env.agentServiceUrl}/agents/assistant/${encodeURIComponent(id)}`, token }), [id, token])
  const agent = useFlueAgent({ client })
  const messages = agent.messages.filter((message) => message.display === 'visible' && (message.role === 'user' || message.role === 'assistant'))
  const busy = agent.status === 'submitted' || agent.status === 'streaming'
  useEffect(() => { bottomRef.current?.scrollIntoView({ block: 'end' }) }, [agent.messages])
  useEffect(() => {
    if (!agent.historyReady || sentPending.current) return
    const pending = readPendingQuestion()
    if (!pending || pending.chatId !== id) return
    sentPending.current = true
    sessionStorage.setItem(`${SEND_KEY_PREFIX}${id}`, JSON.stringify({ question: pending.question, key: pending.idempotencyKey }))
    void agent.sendMessage(pending.question, { idempotencyKey: pending.idempotencyKey })
      .then(() => {
        sessionStorage.removeItem(PENDING_KEY)
        sessionStorage.removeItem(`${SEND_KEY_PREFIX}${id}`)
      })
      .catch((cause: unknown) => { setDraft(pending.question); setError(errorMessage(cause)) })
  }, [agent, agent.historyReady, id])
  async function send() {
    const question = draft.trim()
    if (!question || busy) return
    setDraft('')
    setError(null)
    try {
      await agent.sendMessage(question, { idempotencyKey: idempotencyKeyFor(id, question) })
      sessionStorage.removeItem(`${SEND_KEY_PREFIX}${id}`)
      const pending = readPendingQuestion()
      if (pending?.chatId === id && pending.question === question) sessionStorage.removeItem(PENDING_KEY)
    }
    catch (cause) { setDraft(question); setError(errorMessage(cause)) }
  }
  return <div className={styles.thread}>
    <div className={styles.transcript} aria-live="polite" aria-label="Сообщения чата">
      {!agent.historyReady && <p className={styles.notice}>Загружаем историю…</p>}
      {messages.map((message) => <div className={styles.message} data-role={message.role} key={message.id}>
        <span className={styles.avatar}>{message.role === 'assistant' ? <BankIcon name="bot" /> : 'А'}</span>
        <div>{message.parts.filter((part) => part.type === 'text').map((part) => part.text).join('') || 'Думаю…'}</div>
      </div>)}
      {busy && messages.at(-1)?.role !== 'assistant' && <p className={styles.notice}>Агент думает…</p>}
      <div ref={bottomRef} />
    </div>
    {(error || agent.error) && <p className={styles.error} role="alert">{error || errorMessage(agent.error)}</p>}
    <Composer value={draft} setValue={setDraft} send={() => void send()} busy={busy} stop={() => void client.abort()} disabled={!agent.historyReady} />
  </div>
}

export function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [customToken, setCustomToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) ?? '')
  const [tokenDraft, setTokenDraft] = useState(customToken)
  const [draft, setDraft] = useState('')
  const [accessOpen, setAccessOpen] = useState(false)
  const [allOpen, setAllOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const token = customToken
  const list = useInfiniteQuery({
    queryKey: ['chats', 'active', token],
    queryFn: ({ pageParam }) => chatApi.list(token, 'active', pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled: Boolean(token),
    retry: false,
  })
  const create = useMutation({ mutationFn: () => chatApi.create(token), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chats'] }) })
  const chats = list.data?.pages.flatMap((page) => page.items) ?? []

  async function start(question = '') {
    setError(null)
    if (!token) { setDraft(question || draft); setAccessOpen(true); return }
    try {
      const chat = await create.mutateAsync()
      if (question.trim()) {
        sessionStorage.setItem(PENDING_KEY, JSON.stringify({ chatId: chat.id, question: question.trim(), idempotencyKey: crypto.randomUUID() } satisfies PendingQuestion))
      }
      navigate(routes.chatById(chat.id))
    } catch (cause) {
      setError(errorMessage(cause))
      if (isAuthError(cause)) { setTokenDraft(''); setAccessOpen(true) }
    }
  }
  async function submitToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = tokenDraft.trim().replace(/^Bearer\s+/i, '')
    if (!next) return
    setConnecting(true)
    setError(null)
    try {
      await chatApi.list(next)
      sessionStorage.setItem(TOKEN_KEY, next)
      setCustomToken(next)
      setAccessOpen(false)
    } catch (cause) { setError(errorMessage(cause)) }
    finally { setConnecting(false) }
  }
  const visibleTabs = chats.slice(0, 3)

  return <BankShell><div className={styles.page}>
    <div className={styles.toolbar}>
      <Link className={styles.back} to={routes.briefing}><span aria-hidden="true">←</span>Брифинг</Link>
      <span className={styles.toolbarLabel}>Диалоги</span>
      <div className={styles.dialogTabs} role="group" aria-label="Диалоги">
        <button className={`${styles.newTab} ${!id ? styles.selectedTab : ''}`} type="button" onClick={() => navigate(routes.chat)}><span>＋</span>Новый диалог</button>
        {visibleTabs.map((chat) => <button className={`${styles.dialogTab} ${id === chat.id ? styles.selectedTab : ''}`} type="button" key={chat.id} onClick={() => navigate(routes.chatById(chat.id))}><MessageSquareText size={16} strokeWidth={1.8} />{chatTitle(chat)}</button>)}
        <div className={styles.allWrap}><button className={styles.allTab} type="button" aria-expanded={allOpen} onClick={() => setAllOpen((open) => !open)}><List size={18} strokeWidth={1.8} />Все диалоги<span className={styles.down}>⌄</span></button>
          {allOpen && <div className={styles.allMenu} role="menu" aria-label="Все диалоги">
            {token && list.isPending && <span className={styles.menuNotice}>Загружаем диалоги…</span>}
            {token && list.isError && <button role="menuitem" type="button" onClick={() => void list.refetch()}>Не удалось загрузить. Повторить</button>}
            {token && list.isSuccess && chats.length === 0 && <span className={styles.menuNotice}>Диалогов пока нет</span>}
            {chats.map((chat) => <button role="menuitem" type="button" key={chat.id} onClick={() => { navigate(routes.chatById(chat.id)); setAllOpen(false) }}>{chatTitle(chat)}</button>)}
            {list.hasNextPage && <button role="menuitem" type="button" disabled={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()}>{list.isFetchingNextPage ? 'Загружаем…' : 'Показать ещё'}</button>}
            <button role="menuitem" type="button" onClick={() => { setTokenDraft(customToken); setAccessOpen(true); setAllOpen(false) }}>{token ? 'Сменить JWT' : 'Подключить AgentService'}</button>
          </div>}
        </div>
      </div>
    </div>
    {id && token ? <Conversation key={`${id}:${token}`} id={id} token={token} /> : <div className={styles.landing}><div className={styles.landingInner}>
      <div className={styles.welcome}><h1>Что разберём сегодня, Алексей?</h1><p>Помогу связать события с задачами вашего бизнеса.</p></div>
      <Composer value={draft} setValue={setDraft} send={() => void start(draft)} disabled={create.isPending} />
      <div className={styles.promptArea}><div className={styles.promptHeading}>МОЖНО НАЧАТЬ С ЭТОГО</div>
        <div className={styles.prompts}>{suggestions.map((item) => <button className={styles.prompt} type="button" key={item.title} onClick={() => void start(item.title)}><item.Icon size={20} strokeWidth={1.8} /><ArrowRight className={styles.promptArrow} size={18} strokeWidth={1.8} /><strong>{item.title}</strong><small>{item.detail}</small></button>)}</div>
      </div>
    </div></div>}
    {error && <p className={styles.error} role="alert">{error}</p>}
    {accessOpen && <div className={styles.accessBackdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) setAccessOpen(false) }}><form className={styles.accessDialog} onSubmit={submitToken}>
      <button className={styles.accessClose} type="button" aria-label="Закрыть" onClick={() => setAccessOpen(false)}>×</button>
      <h2>Подключить Агента</h2><p>Для ответа подключите доступ к AgentService.</p><label htmlFor="agent-token">JWT пользователя</label>
      <input id="agent-token" type="password" value={tokenDraft} onChange={(event) => setTokenDraft(event.target.value)} placeholder="Вставьте JWT" autoComplete="off" required />
      {error && <p className={styles.accessError} role="alert">{error}</p>}
      <button type="submit" disabled={connecting}>{connecting ? 'Проверяем…' : 'Подключиться'}</button>
    </form></div>}
  </div></BankShell>
}
