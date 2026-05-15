import { createRoot } from 'react-dom/client'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Home from './pages/Home/Home.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  }
]);

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />,
)
