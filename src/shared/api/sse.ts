import { env } from '@/shared/config'
import { buildHeaders } from './client'
import { ApiError } from './client'

export interface SseMessage {
  event: string
  data: string
}

export async function streamSse(
  path: string,
  body: unknown,
  onMessage: (message: SseMessage) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    method: 'POST',
    headers: buildHeaders({ Accept: 'text/event-stream' }),
    body: JSON.stringify(body),
    signal,
  })
  if (!response.ok || !response.body) throw new ApiError(response.status, null)

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ''

  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += value

    let separator: number
    while ((separator = buffer.indexOf('\n\n')) !== -1) {
      const chunk = buffer.slice(0, separator)
      buffer = buffer.slice(separator + 2)

      let event = 'message'
      const data: string[] = []
      for (const line of chunk.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim()
        else if (line.startsWith('data:')) data.push(line.slice(5).trimStart())
      }
      if (data.length) onMessage({ event, data: data.join('\n') })
    }
  }
}
