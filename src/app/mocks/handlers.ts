import { delay, http, HttpResponse } from 'msw'
import { env } from '@/shared/config'
import { mockCompany, mockInsights, mockUser } from './data'

const api = (path: string) => `${env.apiUrl}${path}`
const session = { token: 'mock-token', userId: mockUser.id }

export const handlers = [
  http.post(api('/auth/login'), async () => {
    await delay(400)
    return HttpResponse.json(session)
  }),
  http.post(api('/auth/register'), async () => {
    await delay(400)
    return HttpResponse.json(session)
  }),

  http.get(api('/user-service/users/:id'), () => HttpResponse.json(mockUser)),

  http.get(api('/company-service/companies/my'), () => HttpResponse.json(mockCompany)),

  http.get(api('/insight-service/insights'), async ({ request }) => {
    await delay(300)
    const impact = new URL(request.url).searchParams.get('impact')
    const list = impact ? mockInsights.filter((i) => i.impact === impact) : mockInsights
    return HttpResponse.json(list)
  }),
  http.get(api('/insight-service/insights/:id'), ({ params }) => {
    const insight = mockInsights.find((i) => i.id === params.id)
    return insight ? HttpResponse.json(insight) : new HttpResponse(null, { status: 404 })
  }),

  http.post(api('/agent-service/chat'), () => {
    const answer =
      'Это демо-ответ из моков. Когда AgentService будет готов, здесь появится настоящий анализ.'
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        for (const word of answer.split(' ')) {
          await delay(60)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: `${word} ` })}\n\n`))
        }
        controller.close()
      },
    })
    return new HttpResponse(stream, { headers: { 'Content-Type': 'text/event-stream' } })
  }),
]
