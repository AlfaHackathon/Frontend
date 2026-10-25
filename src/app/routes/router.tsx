import { createBrowserRouter } from 'react-router'
import { CompanyPage } from '@/pages/company'
import { ChatPage } from '@/pages/chat'
import { FeedPage } from '@/pages/feed'
import { HowItWorksPage } from '@/pages/how-it-works'
import { InsightPage } from '@/pages/insight'
import { InsightsPage } from '@/pages/insights'
import { InvitePage } from '@/pages/invite'
import { LoginPage } from '@/pages/login'
import { BankPage } from '@/pages/bank'
import { BriefingHomePage } from '@/pages/briefing-home'
import { NotFoundPage } from '@/pages/not-found'
import { RegisterPage } from '@/pages/register'
import { routes } from '@/shared/config'
import { AuthLayout } from '../layouts/AuthLayout'
import { MainLayout } from '../layouts/MainLayout'
import { GuestOnly, RequireAuth } from './guards'

export const router = createBrowserRouter([
  {
    element: <GuestOnly />,
    children: [
      { path: routes.login, element: <LoginPage /> },
      {
        element: <AuthLayout />,
        children: [
          { path: routes.register, element: <RegisterPage /> },
          { path: routes.invite, element: <InvitePage /> },
        ],
      },
    ],
  },
  { path: routes.bank, element: <BankPage /> },
  { path: '/alfa-business', element: <BankPage /> },
  { path: routes.briefing, element: <BriefingHomePage /> },
  { path: routes.chat, element: <ChatPage /> },
  { path: `${routes.chat}/:id`, element: <ChatPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: routes.feed, element: <FeedPage /> },
          { path: routes.insights, element: <InsightsPage /> },
          { path: routes.insight(':id'), element: <InsightPage /> },
          { path: routes.company, element: <CompanyPage /> },
          { path: routes.howItWorks, element: <HowItWorksPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
