import { createBrowserRouter, Navigate } from 'react-router'
import { AnalyticsPage } from '@/pages/analytics'
import { BankPage } from '@/pages/bank'
import { BriefingHomePage } from '@/pages/briefing-home'
import { ChatPage } from '@/pages/chat'
import { FeedPage } from '@/pages/feed'
import { InsightPage } from '@/pages/insight'
import { LoginPage } from '@/pages/login'
import { NewsPage } from '@/pages/news'
import { NotFoundPage } from '@/pages/not-found'
import { routes } from '@/shared/config'
import { MainLayout } from '../layouts/MainLayout'
import { RequireSession } from './RequireSession'

export const router = createBrowserRouter([
  { path: routes.login, element: <LoginPage /> },
  {
    element: <RequireSession />,
    children: [
      { path: routes.bankHome, element: <BankPage /> },
      { path: '/alfa-business', element: <BankPage /> },
      { path: routes.home, element: <BriefingHomePage /> },
      { path: routes.chat, element: <ChatPage /> },
      { path: `${routes.chat}/:id`, element: <ChatPage /> },
      {
        element: <MainLayout />,
        children: [
          { path: routes.feed, element: <FeedPage /> },
          { path: routes.insight(':id'), element: <InsightPage /> },
          { path: routes.agent, element: <Navigate to={routes.chat} replace /> },
          { path: routes.analytics, element: <AnalyticsPage /> },
          { path: routes.news, element: <NewsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
