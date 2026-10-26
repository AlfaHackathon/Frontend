# Frontend — Альфа-Брифинг для бизнеса

Веб-клиент AlfaHackathon. React 19 + TypeScript + Vite, архитектура — [Feature-Sliced Design](https://feature-sliced.design/ru/).

## Быстрый старт

```sh
npm install
npm run dev
```

Откроется http://localhost:5173. По умолчанию фронт обращается к живым сервисам через
`https://api.cheremha.ru`; для входа нужны действующие учётные данные.

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
| AuthService    | `/auth-service`    | `entities/session`          |
| UserService    | `/user-service`    | `entities/user`             |
| CompanyService | `/company-service` | `entities/company`          |
| InsightService | `/insight-service` | `entities/insight`          |
| AgentService   | `/agent-service`   | `features/agent-chat` (SSE) |

### Чат на Flue

Страница `/chat` работает с AgentService через `/agent-service`. Список чатов загружается постранично через `GET /chats`, новый чат создаётся через `POST /chats`. Крестик у вкладки архивирует чат и убирает его из активного списка; восстановить его можно через «Все диалоги» → «Архив». У AgentService пока нет маршрута для безвозвратного удаления чата. История, отправка сообщений, потоковые ответы и остановка генерации работают через `@flue/sdk` и `@flue/react` по `/agents/assistant/{chatId}`. Текущий [Swagger AgentService](https://api.cheremha.ru/agent-service/swagger/index.html) принимает только текстовые сообщения: вложения и выбор источника ответа пока недоступны.

После входа `/chat` использует полученный пользовательский JWT. Страница также позволяет вручную указать JWT при прямом открытии без сессии. Адрес сервиса можно переопределить через `VITE_AGENT_SERVICE_URL`.

### Вход

Форма отправляет `{email,password}` в `POST /auth-service/login` через AuthGateway. Ответ `{accessToken,refreshToken}` сверяется с [контрактом AuthService](https://api.cheremha.ru/auth-service/swagger/index.html); ID пользователя берётся из claim `UserId` access-токена. Токен сохраняется в `localStorage` и передаётся UserService и AgentService как Bearer. При выходе сессия и кэш запросов очищаются. Сейчас при истечении access-токена нужен повторный вход.

### Моки

- Включаются только при явном `VITE_USE_MOCKS=true`; в `.env.development` и `.env.production` используется живой API.
- Инсайты в этом режиме читаются напрямую из `src/entities/insight/model/demo-insights.ts`; их показ не зависит от регистрации Service Worker.
- Хендлеры MSW — `src/app/mocks/handlers.ts`.
- AuthService и UserService не подменяются моками; остальные хендлеры остаются для демонстрационных данных.

### Работа с живым бэком локально

По умолчанию Vite проксирует `/api/*` на `https://api.cheremha.ru/*`. Для другого AuthGateway создайте `.env.local`:

```sh
VITE_GATEWAY_URL=http://localhost:8080   # адрес AuthGateway
```

Для локального показа демонстрационной ленты можно временно задать `VITE_USE_MOCKS=true` в `.env.local`.

## Хостинг на сервере

Соберите статику командой `npm run build` и отдавайте `dist` вашим веб-сервером. При `VITE_API_URL=/api` настройте прокси на AuthGateway с удалением префикса `/api`; пример для nginx:

```nginx
location /api/ {
    proxy_pass https://api.cheremha.ru/;
    proxy_set_header Host api.cheremha.ru;
}
```

Для собственного gateway замените адрес и Host. Маршрут `/agent-service/` также должен проксироваться на AgentService через AuthGateway; для SSE отключите буферизацию прокси. На Vercel маршруты `/api/*` и `/agent-service/*` описаны в `vercel.json`.

Главная страница брифинга и лента инсайтов читают InsightService. Банковский макет и часть раздела компании пока используют демонстрационные данные: для них в проекте нет соответствующего подключения к банковскому API.

## Git

- `main` — всегда рабочий, туда только через PR.
- Ветки: `feature/<что-делаю>`, `fix/<что-чиню>`.
