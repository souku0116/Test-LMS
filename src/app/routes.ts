import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { Users } from './pages/admin/Users';
import { Fields } from './pages/admin/Fields';
import { Login } from './pages/Login';
import { Setup } from './pages/Setup';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: 'leads',
        Component: Leads,
      },
      {
        path: 'users',
        Component: Users,
      },
      {
        path: 'fields',
        Component: Fields,
      },
    ],
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/setup',
    Component: Setup,
  },
  {
    path: '*',
    Component: NotFound,
  },
]);
