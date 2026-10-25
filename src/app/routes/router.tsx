import { createBrowserRouter } from 'react-router'
import { AgentPage } from '@/pages/agent'
import { AnalyticsPage } from '@/pages/analytics'
import { BankHomePage } from '@/pages/bank-home'
import { FeedPage } from '@/pages/feed'
import { HomePage } from '@/pages/home'
import { InsightPage } from '@/pages/insight'
import { NewsPage } from '@/pages/news'
import { NotFoundPage } from '@/pages/not-found'
import { routes } from '@/shared/config'
import { MainLayout } from '../layouts/MainLayout'

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: routes.bankHome, element: <BankHomePage /> },
      { path: routes.home, element: <HomePage /> },
      { path: routes.feed, element: <FeedPage /> },
      { path: routes.insight(':id'), element: <InsightPage /> },
      { path: routes.agent, element: <AgentPage /> },
      { path: routes.analytics, element: <AnalyticsPage /> },
      { path: routes.news, element: <NewsPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
