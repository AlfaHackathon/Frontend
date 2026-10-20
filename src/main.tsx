import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App, enableMocks } from '@/app'

enableMocks().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
