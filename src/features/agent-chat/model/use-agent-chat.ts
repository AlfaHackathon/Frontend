import { useCallback, useRef, useState } from 'react'
import { streamSse } from '@/shared/api'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
}

const CHAT_PATH = '/agent-service/chat'

export function useAgentChat(context?: { insightId?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const send = useCallback(
    async (text: string) => {
      const assistantId = crypto.randomUUID()
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'user', text },
        { id: assistantId, role: 'assistant', text: '' },
      ])
      setError(null)
      setIsStreaming(true)
      abortRef.current = new AbortController()

      const appendDelta = (delta: string) =>
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, text: m.text + delta } : m)),
        )

      try {
        await streamSse(
          CHAT_PATH,
          { message: text, ...context },
          ({ event, data }) => {
            if (event === 'message') appendDelta((JSON.parse(data) as { delta: string }).delta)
          },
          abortRef.current.signal,
        )
      } catch (e) {
        if (!(e instanceof DOMException && e.name === 'AbortError')) {
          setError('Ассистент недоступен, попробуйте позже')
        }
      } finally {
        setIsStreaming(false)
      }
    },
    [context],
  )

  const stop = useCallback(() => abortRef.current?.abort(), [])

  return { messages, isStreaming, error, send, stop }
}
