import { createRoot } from 'react-dom/client'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { createBrowserRouter, RouterProvider } from 'react-router'
import Home from './pages/Home/Home.tsx'
import Login from './pages/Login/Login.tsx'
import Register from './pages/Register/Register.tsx'
import Categories from './pages/Categories/Categories.tsx'
import Accounts from './pages/Accounts/Accounts.tsx'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.tsx'
import Goals from './pages/Goals/Goals.tsx'
import Investments from './pages/Investments/Investments.tsx'

import Transactions from './pages/Transactions/Transactions.tsx'

// Global Fetch Interceptor to handle 401 Unauthorized
const { fetch: originalFetch } = window
window.fetch = async (...args) => {
  try {
    const response = await originalFetch(...args)
    
    // Se for 401 e não for uma tentativa de login, limpa o token e redireciona
    if (response.status === 401 && !args[0].toString().includes('/auth/login')) {
      console.warn('Sessão expirada ou inválida. Redirecionando para login...')
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    return response
  } catch (error) {
    // Erros de rede ou requisições abortadas
    throw error
  }
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/categories",
        element: <Categories />
      },
      {
        path: "/accounts",
        element: <Accounts />
      },
      {
        path: "/transactions",
        element: <Transactions />
      },
      {
        path: "/goals",
        element: <Goals />
      },
      {
        path: "/investments",
        element: <Investments />
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />,
)
