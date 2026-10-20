import type { Company } from '@/entities/company'
import type { InsightDetails } from '@/entities/insight'
import type { User } from '@/entities/user'

export const mockUser: User = {
  id: '00000000-0000-0000-0000-000000000001',
  lastName: 'Иванова',
  firstName: 'Анна',
  middleName: null,
  email: 'anna@apelsin.ru',
  createdAt: '2026-10-19T10:00:00Z',
}

export const mockCompany: Company = {
  id: 'c-1',
  name: 'ООО «Апельсин»',
  industry: 'Оптовая торговля продуктами питания',
  members: [
    { userId: mockUser.id, fullName: 'Анна Иванова', position: 'Генеральный директор' },
    { userId: 'u-2', fullName: 'Пётр Смирнов', position: 'Финансовый директор' },
  ],
}

export const mockInsights: InsightDetails[] = [
  {
    id: 'i-1',
    title: 'ЦБ повысил ключевую ставку до 19%',
    summary: 'Кредитная линия компании плавающая — расходы на обслуживание долга вырастут.',
    impact: 'negative',
    effects: [
      { metric: 'debt', change: 6.5 },
      { metric: 'margin', change: -1.2 },
    ],
    source: 'Альфа-Аналитика',
    publishedAt: '2026-10-20T09:30:00Z',
    analysis:
      'По кредитному договору ставка привязана к ключевой. При текущем остатке долга ежемесячный платёж вырастет примерно на 6,5%.',
    recommendations: [
      'Рассмотреть рефинансирование с фиксированной ставкой',
      'Сократить выборку по кредитной линии до конца квартала',
    ],
  },
  {
    id: 'i-2',
    title: 'Сезонный рост спроса на цитрусовые',
    summary: 'Ожидается рост закупок розничных сетей в ноябре–декабре.',
    impact: 'positive',
    effects: [{ metric: 'revenue', change: 12 }],
    source: 'Альфа-Аналитика',
    publishedAt: '2026-10-19T14:00:00Z',
    analysis:
      'Исторически в предновогодний период спрос растёт на 10–15%. Договоры поставки позволяют увеличить объём.',
    recommendations: ['Заранее согласовать дополнительные объёмы с поставщиками'],
  },
  {
    id: 'i-3',
    title: 'Изменения в правилах маркировки с 1 марта',
    summary: 'Расширяется список товаров, подлежащих обязательной маркировке.',
    impact: 'neutral',
    effects: [],
    source: 'Новости Альфа-Банка',
    publishedAt: '2026-10-18T08:00:00Z',
    analysis:
      'Ваша товарная категория пока не входит в список, но может попасть в следующую волну.',
    recommendations: ['Проверить готовность складского учёта к маркировке'],
  },
]
