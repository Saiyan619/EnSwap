import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Providers } from './contexts/Providers.tsx'
import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import routes from './contexts/RouteProvider.tsx'
import { Toaster } from 'sonner'

const router = createBrowserRouter(routes)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="dark">
       <Providers>
      <RouterProvider router={router} />
      <Toaster />
    </Providers>
    </div>
   
  </StrictMode>
)
