import type { InsightIconKind, InsightTone } from '@/entities/insight'

export type FeedCategory = 'all' | 'risks' | 'opportunities' | 'events' | 'peers'

export interface FeedItem {
  id: string
  category: Exclude<FeedCategory, 'all'>
  icon: InsightIconKind
  tone: InsightTone
  label: string
  time: string
  title: string
  summary: string
  tag: { text: string; tone: InsightTone }
  sources: string
  status: string
  questions: string[]
}

export const feedItems: FeedItem[] = [
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
    questions: ['Что если ремонт затянется?', 'Где закупить дешевле?', 'Посчитай влияние на маржу'],
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
    questions: ['Что если ремонт затянется?', 'Как не нарушить ковенант?', 'Подготовь письмо в банк'],
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
    questions: ['Когда ставку могут снизить?', 'Стоит ли рефинансировать долг?'],
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
    questions: ['Касается ли это нас?', 'Какие поставщики надёжнее?'],
  },
]
