import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFlueAgent } from '@flue/react'
import { createFlueClient, type DeliveredAttachment } from '@flue/sdk'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowRight, ArrowUp, FileText, LayoutGrid, Link2, List, MessageSquareText, Paperclip, Sparkles } from 'lucide-react'
import { chatApi, type Chat } from '@/entities/chat'
import { useSession } from '@/entities/session'
import { BankShell } from '@/pages/bank/ui/BankShell'
import { BankIcon } from '@/pages/bank/ui/BankIcon'
import { env, routes } from '@/shared/config'
import styles from './ChatPage.module.css'

const TOKEN_KEY = 'alfa-briefing:agent-token'
const PENDING_KEY = 'alfa-briefing:pending-question'
const sourceOptions = ['Новости и данные компании', 'Только новости', 'Только данные компании']
const samples = ['Закупки топлива и маржа', 'Ключевая ставка', 'Логистика и поставки']
const suggestions = [
  { title: 'Что изменилось за сутки?', detail: 'Главное для нашей компании', Icon: FileText },
  { title: 'Что происходит с закупками?', detail: 'Риски для стоимости топлива', Icon: Sparkles },
  { title: 'Разобрать последний инсайт', detail: 'Вывод и исходные новости', Icon: LayoutGrid },
] as const
let pendingSubmission: { question: string; files: File[] } | null = null

async function attachmentsFrom(files: File[]): Promise<DeliveredAttachment[]> {
  return Promise.all(files.map(async (file): Promise<DeliveredAttachment> => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') throw new Error('Можно прикрепить изображение или PDF.')
    if (file.size > 10 * 1024 * 1024) throw new Error('Файл должен быть меньше 10 МБ.')
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
    return file.type === 'application/pdf'
      ? { type: 'document', data, mimeType: 'application/pdf', filename: file.name }
      : { type: 'image', data, mimeType: file.type, filename: file.name }
  }))
}

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'status' in error) {
    if (error.status === 401 || error.status === 403) return 'Нужен действующий JWT с доступом к AgentService.'
    return `Сервис вернул ошибку ${error.status}. Попробуйте ещё раз.`
  }
  return error instanceof Error ? error.message : 'Не удалось выполнить запрос.'
}

function chatTitle(chat: Chat) { return chat.title?.trim() || 'Новый диалог' }

function Composer({ value, setValue, send, busy = false, stop, disabled = false }: {
  value: string; setValue: (value: string) => void; send: (files: File[]) => void; busy?: boolean; stop?: () => void; disabled?: boolean
}) {
  const [source, setSource] = useState(sourceOptions[0])
  const [sourceOpen, setSourceOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); if (!disabled && !busy && value.trim()) send(files) }
  }
  return <div className={styles.composerWrap}>
    <div className={styles.composer}>
      <textarea aria-label="Вопрос агенту" placeholder="Спросите, что это значит для вашего бизнеса" value={value}
        onChange={(event) => setValue(event.target.value)} onKeyDown={keyDown} disabled={disabled} />
      {files.length > 0 && <div className={styles.files}>{files.map((file, index) => <span key={index}>{file.name}<button type="button" aria-label={`Убрать ${file.name}`} onClick={() => setFiles((items) => items.filter((_, i) => i !== index))}>×</button></span>)}</div>}
      <div className={styles.composerActions}>
        <input ref={inputRef} className={styles.visuallyHidden} type="file" multiple accept="image/*,.pdf" aria-label="Прикрепить файл" onChange={(event) => setFiles((items) => [...items, ...Array.from(event.target.files ?? [])])} />
        <button className={styles.attach} type="button" aria-label="Прикрепить файл" onClick={() => inputRef.current?.click()}><Paperclip size={21} strokeWidth={2} /></button>
        <div className={styles.sourceWrap}>
          <button className={styles.source} type="button" aria-expanded={sourceOpen} onClick={() => setSourceOpen((open) => !open)}><Link2 size={17} strokeWidth={2} />{source}</button>
          {sourceOpen && <div className={styles.sourceMenu} role="menu" aria-label="Источники ответа">{sourceOptions.map((option) => <button type="button" role="menuitemradio" aria-checked={source === option} key={option} onClick={() => { setSource(option); setSourceOpen(false) }}>{option}{source === option && <span>✓</span>}</button>)}</div>}
        </div>
        {busy ? <button className={styles.send} type="button" aria-label="Остановить ответ" onClick={stop}>■</button>
          : <button className={styles.send} type="button" aria-label="Отправить вопрос" onClick={() => send(files)} disabled={disabled || !value.trim()}><ArrowUp size={23} strokeWidth={2} /></button>}
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
    const pending = pendingSubmission?.question ?? sessionStorage.getItem(PENDING_KEY)
    if (!pending) return
    sentPending.current = true
    sessionStorage.removeItem(PENDING_KEY)
    const files = pendingSubmission?.files ?? []
    pendingSubmission = null
    void attachmentsFrom(files).then((attachments) => agent.sendMessage(pending, { idempotencyKey: crypto.randomUUID(), images: attachments.filter((item) => item.type === 'image'), documents: attachments.filter((item) => item.type === 'document') })).catch((cause: unknown) => { setDraft(pending); setError(errorMessage(cause)) })
  }, [agent, agent.historyReady])
  async function send(files: File[]) {
    const question = draft.trim()
    if (!question || busy) return
    setDraft('')
    setError(null)
    try {
      const attachments = await attachmentsFrom(files)
      await agent.sendMessage(question, { idempotencyKey: crypto.randomUUID(), images: attachments.filter((item) => item.type === 'image'), documents: attachments.filter((item) => item.type === 'document') })
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
    <Composer value={draft} setValue={setDraft} send={(files) => void send(files)} busy={busy} stop={() => void client.abort()} disabled={!agent.historyReady} />
  </div>
}

export function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const session = useSession()
  const [customToken, setCustomToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) ?? '')
  const [tokenDraft, setTokenDraft] = useState(customToken)
  const [draft, setDraft] = useState('')
  const [accessOpen, setAccessOpen] = useState(false)
  const [allOpen, setAllOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const token = customToken || session?.token || ''
  const list = useQuery({ queryKey: ['chats', 'active', token], queryFn: () => chatApi.list(token), enabled: Boolean(token), retry: false })
  const create = useMutation({ mutationFn: () => chatApi.create(token), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chats'] }) })
  const chats = list.data ?? []

  async function start(question = '', files: File[] = []) {
    setError(null)
    if (!token) { setDraft(question || draft); setAccessOpen(true); return }
    try {
      const chat = await create.mutateAsync()
      if (question.trim()) { pendingSubmission = { question: question.trim(), files }; sessionStorage.setItem(PENDING_KEY, question.trim()) }
      navigate(routes.chatById(chat.id))
    } catch (cause) { setError(errorMessage(cause)) }
  }
  async function submitToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = tokenDraft.trim().replace(/^Bearer\s+/i, '')
    if (!next) return
    setConnecting(true)
    setError(null)
    try {
      const existing = await chatApi.list(next)
      queryClient.setQueryData(['chats', 'active', next], existing)
      sessionStorage.setItem(TOKEN_KEY, next)
      setCustomToken(next)
      setAccessOpen(false)
    } catch (cause) { setError(errorMessage(cause)) }
    finally { setConnecting(false) }
  }
  const visibleTabs = chats.length ? chats.slice(0, 3).map((chat) => ({ id: chat.id, title: chatTitle(chat) })) : samples.map((title) => ({ id: '', title }))

  return <BankShell><div className={styles.page}>
    <div className={styles.toolbar}>
      <Link className={styles.back} to={routes.briefing}><span aria-hidden="true">←</span>Брифинг</Link>
      <span className={styles.toolbarLabel}>Диалоги</span>
      <div className={styles.dialogTabs} role="group" aria-label="Диалоги">
        <button className={`${styles.newTab} ${!id ? styles.selectedTab : ''}`} type="button" onClick={() => navigate(routes.chat)}><span>＋</span>Новый диалог</button>
        {visibleTabs.map((chat) => <button className={`${styles.dialogTab} ${id && chat.id === id ? styles.selectedTab : ''}`} type="button" key={chat.title} onClick={() => chat.id ? navigate(routes.chatById(chat.id)) : setDraft(chat.title)}><MessageSquareText size={16} strokeWidth={1.8} />{chat.title}</button>)}
        <div className={styles.allWrap}><button className={styles.allTab} type="button" aria-expanded={allOpen} onClick={() => setAllOpen((open) => !open)}><List size={18} strokeWidth={1.8} />Все диалоги · {chats.length || 8}<span className={styles.down}>⌄</span></button>
          {allOpen && <div className={styles.allMenu} role="menu" aria-label="Все диалоги">
            {chats.length ? chats.map((chat) => <button role="menuitem" type="button" key={chat.id} onClick={() => { navigate(routes.chatById(chat.id)); setAllOpen(false) }}>{chatTitle(chat)}</button>) : samples.map((title) => <button role="menuitem" type="button" key={title} onClick={() => { setDraft(title); setAllOpen(false) }}>{title}</button>)}
            <button role="menuitem" type="button" onClick={() => { setAccessOpen(true); setAllOpen(false) }}>Подключить AgentService</button>
          </div>}
        </div>
      </div>
    </div>
    {id && token ? <Conversation key={`${id}:${token}`} id={id} token={token} /> : <div className={styles.landing}><div className={styles.landingInner}>
      <div className={styles.welcome}><h1>Что разберём сегодня, Алексей?</h1><p>Помогу связать события с задачами вашего бизнеса.</p></div>
      <Composer value={draft} setValue={setDraft} send={(files) => void start(draft, files)} disabled={create.isPending} />
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
