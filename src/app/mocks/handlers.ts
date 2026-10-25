import { delay, http, HttpResponse } from 'msw'
import { env } from '@/shared/config'
import { mockCompany, mockGroup, mockInsights, mockMembers } from './data'

const api = (path: string) => `${env.apiUrl}${path}`
export const handlers = [
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
