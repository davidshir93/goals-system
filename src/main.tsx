import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './router.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { GoalsProvider } from './context/GoalsContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <GoalsProvider>
        <RouterProvider router={router} />
      </GoalsProvider>
    </AuthProvider>
  </StrictMode>,
)
