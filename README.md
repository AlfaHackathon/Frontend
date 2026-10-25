# Frontend — Альфа-Брифинг для бизнеса

Веб-клиент AlfaHackathon. React 19 + TypeScript + Vite, архитектура — [Feature-Sliced Design](https://feature-sliced.design/ru/).

## Быстрый старт

```sh
npm install
npm run dev
```

Откроется http://localhost:5173. По умолчанию фронт работает **на моках** (MSW) — бэк не нужен,
войти можно с любой почтой и паролем.

## Команды

| Команда           | Что делает                                  |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | dev-сервер                                  |
| `npm run build`   | проверка типов + продакшен-сборка в `dist/` |
| `npm run preview` | посмотреть собранную версию                 |

## Структура

```
src/
├── app/        инициализация: роутер, layouts, guards, react-query, глобальные стили, моки
├── pages/      страницы — по одной на экран из Figma
├── widgets/    крупные самостоятельные блоки страниц (шапка, лента)
├── features/   действия пользователя (вход, регистрация, фильтр, чат с агентом)
├── entities/   бизнес-сущности: типы, запросы к API, UI-карточки (session, user, company, insight)
└── shared/     без бизнес-логики: UI-кит, api-клиент, конфиг, утилиты
```

Экраны Figma → страницы:

| Figma                          | Путь             | Страница             |
| ------------------------------ | ---------------- | -------------------- |
| 01-Вход                        | `/login`         | `pages/login`        |
| 02-Регистрация                 | `/register`      | `pages/register`     |
| 02b-Регистрация-по-приглашению | `/invite/:token` | `pages/invite`       |
| 03-Инсайты                     | `/insights`      | `pages/insights`     |
| 04-Лента-инсайтов              | `/`              | `pages/feed`         |
| 05-Как-сервис-учится           | `/how-it-works`  | `pages/how-it-works` |
| 06-Разбор-инсайта              | `/insights/:id`  | `pages/insight`      |
| 07b-Компания-вид-участника     | `/company`       | `pages/company`      |
| Чат с ассистентом              | `/chat`          | `pages/chat`         |

## Договорённости

1. **Импорт только вниз:** `app → pages → widgets → features → entities → shared`.
   Фича не может импортировать другую фичу, entity — фичу и т. д.
2. **Только через публичный API:** снаружи слайса импортируем из его `index.ts`:
   `import { InsightCard } from '@/entities/insight'`, а не `.../insight/ui/InsightCard`.
3. **Внутри слайса — сегменты по назначению:** `ui/`, `model/`, `api/`, `lib/`, `config/`.
   Не `components/`, `hooks/`, `utils/`.
4. **Абсолютные импорты** через `@/`, относительные — только внутри своего слайса.
5. **Пути — только из `routes`** (`@/shared/config`), без строк `'/insights/' + id`.
6. **Сеть — только через `apiClient`** (`@/shared/api`). Никаких `fetch` в компонентах.
7. **Серверные данные — через react-query** (хуки `useXxx` в `entities/*/api`), не через `useState + useEffect`.

### Куда положить новый код

- Новый экран → `pages/<name>/ui/<Name>Page.tsx` + `index.ts`, маршрут в `app/routes/router.tsx`, путь в `shared/config/routes.ts`.
- Новый запрос к бэку → `entities/<entity>/api/`. Мок для него → `app/mocks/handlers.ts`.
- Кнопка/форма, которая что-то **делает** → `features/<action>/`.
- Переиспользуемый «глупый» компонент без бизнес-смысла → `shared/ui/<name>/`.

## API и бэкенд

Все запросы идут на `VITE_API_URL` (по умолчанию `/api`) → **AuthGateway** → сервисы.
Токен из `localStorage` автоматически кладётся в `Authorization: Bearer …`.

| Сервис         | Префикс            | Где во фронте               |
| -------------- | ------------------ | --------------------------- |
| AuthGateway    | `/auth`            | `entities/session`          |
| UserService    | `/user-service`    | `entities/user`             |
| CompanyService | `/company-service` | `entities/company`          |
| InsightService | `/insight-service` | `entities/insight`          |
| AgentService   | `/agent-service`   | `features/agent-chat` (SSE) |

### Чат на Flue

Страница `/chat` работает с `https://api.cheremha.ru/agent-service` через одноимённый локальный прокси Vite и rewrite Vercel. Список и создание чатов идут через REST; история, потоковые ответы, остановка генерации и вложения изображений/PDF — через `@flue/sdk` и `@flue/react`. Выбор источника ответа пока работает только в интерфейсе: отдельного параметра фильтра в текущем API нет.

Для `/chat` не нужен вход через почту и пароль основного приложения: страница доступна напрямую и предлагает ввести JWT при отправке первого вопроса. Токен проверяется запросом к AgentService и хранится в `sessionStorage` только этой вкладки. Если приложение запущено с моковой авторизацией, тестовый токен входа не подойдёт — укажите настоящий JWT. Адрес сервиса можно переопределить через `VITE_AGENT_SERVICE_URL`.

> Контракты, кроме UserService, пока предположительные — места помечены `TODO`.
> Когда бэк опубликует ручки, правим типы в `entities/*/model/types.ts` и пути в `entities/*/api`.

### Моки

- Включаются переменной `VITE_USE_MOCKS=true` (см. `.env.development`, `.env.production`).
- Хендлеры — `src/app/mocks/handlers.ts`, данные — `src/app/mocks/data.ts`.
- Код приложения про моки не знает: MSW перехватывает запросы на уровне сети.

### Работа с живым бэком локально

Создайте `.env.local`:

```sh
VITE_USE_MOCKS=false
VITE_GATEWAY_URL=http://localhost:8080   # адрес AuthGateway
```

Vite будет проксировать `/api/*` на gateway.

## Деплой на Vercel

1. Vercel → **Add New → Project** → импортировать `AlfaHackathon/Frontend`.
2. Framework определится как Vite, настройки по умолчанию подходят (`npm run build`, `dist`).
3. Каждый push в `main` → продакшен, каждый PR → отдельная preview-ссылка.

Пока бэк не доступен из интернета, прод работает на моках (`.env.production`).
Когда у AuthGateway появится публичный адрес — добавить в `vercel.json` **перед** SPA-правилом:

```json
{ "source": "/api/:path*", "destination": "https://<адрес-gateway>/:path*" }
```

и поставить `VITE_USE_MOCKS=false`. Так браузер ходит на тот же домен, и CORS настраивать не нужно.

## Git

- `main` — всегда рабочий, туда только через PR.
- Ветки: `feature/<что-делаю>`, `fix/<что-чиню>`.
