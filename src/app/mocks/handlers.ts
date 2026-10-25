import { delay, http, HttpResponse } from 'msw'
import { env } from '@/shared/config'
import { mockCompany, mockGroup, mockInsights, mockMembers, mockUser } from './data'

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

  http.get(api('/company-service/companies/me'), () => HttpResponse.json(mockCompany)),
  http.get(api('/company-service/companies/me/members'), () => HttpResponse.json(mockMembers)),
  http.get(api('/company-service/companies/me/group'), () => HttpResponse.json(mockGroup)),

  http.get(api('/insight-service/insights'), async ({ request }) => {
    await delay(300)
    const category = new URL(request.url).searchParams.get('category')
    const list = category ? mockInsights.filter((i) => i.category === category) : mockInsights
    return HttpResponse.json(list)
  }),
  http.get(api('/insight-service/insights/:id'), ({ params }) => {
    const insight = mockInsights.find((i) => i.id === params.id)
    return insight ? HttpResponse.json(insight) : new HttpResponse(null, { status: 404 })
  }),

]
