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
    id: 'fuel-price',
    category: 'risks',
    icon: 'risk',
    tone: 'red',
    label: 'Риск · сильное влияние',
    time: 'сегодня, 08:42',
    title: 'Закупка АИ-95 подорожает на 5–8% в ближайшие 2 недели',
    summary:
      'Остановлен НПЗ, с которого идёт 35% ваших закупок по долгосрочному договору. Ремонт займёт около месяца.',
    tag: { text: 'Позиция Альфа-Банка', tone: 'red' },
    sources: 'Аналитика Альфа-Банка, Альфа-Инвестиции',
    status: 'В работе у Олега М.',
    pending: false,
    questions: ['Что если ремонт затянется?', 'Где закупить дешевле?', 'Посчитай влияние на маржу'],
    analysis: '',
    recommendations: [],
  },
  {
    id: 'covenant',
    category: 'risks',
    icon: 'risk',
    tone: 'red',
    label: 'Риск · сильное влияние',
    time: 'сегодня, 08:45',
    title: 'Ковенант по долгу/EBITDA может быть нарушен в IV квартале',
    summary:
      'Если маржа сожмётся по базовому сценарию, отношение долга к EBITDA вырастет с 2,9 до 3,2 при лимите 3,0 в кредитном договоре.',
    tag: { text: 'Расчёт', tone: 'green' },
    sources: 'Связан с 2 инсайтами · ваш кредитный договор',
    status: 'Ждёт вашего решения',
    pending: true,
    questions: ['Что если ремонт затянется?', 'Как не нарушить ковенант?', 'Подготовь письмо в банк'],
    analysis: '',
    recommendations: [],
  },
  {
    id: 'key-rate',
    category: 'events',
    icon: 'rate',
    tone: 'blue',
    label: 'Событие · среднее влияние',
    time: 'вчера',
    title: 'ЦБ сохранил ключевую ставку',
    summary:
      'Плавающая часть долга не подешевеет до декабря. На платежи по кредиту в IV квартале не влияет.',
    tag: { text: 'Факт', tone: 'blue' },
    sources: 'Альфа-Инвестиции · макрообзор',
    status: '«Уже учли» — Андрей С.',
    pending: false,
    questions: ['Когда ставку могут снизить?', 'Стоит ли рефинансировать долг?'],
    analysis: '',
    recommendations: [],
  },
  {
    id: 'peer-fuel',
    category: 'peers',
    icon: 'risk',
    tone: 'red',
    label: 'Риск · среднее влияние',
    time: 'вчера',
    title: 'У похожей сети скоро начнутся перебои с топливом',
    summary:
      'Сеть с похожей структурой закупок предупредила партнёров о задержках поставок с того же НПЗ.',
    tag: { text: 'Похожая компания', tone: 'red' },
    sources: 'Аналитика Альфа-Банка',
    status: 'Новый',
    pending: false,
    questions: ['Касается ли это нас?', 'Какие поставщики надёжнее?'],
    analysis: '',
    recommendations: [],
  },
]
