import React, { ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Settings, LogOut, FileText, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Layout = () => {
  const { user, role, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) {
    navigate('/login');
    return null;
  }

  const links = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['user', 'admin', 'superadmin'] },
    { name: 'Leads', href: '/leads', icon: FileText, roles: ['user', 'admin', 'superadmin'] },
    { name: 'Users', href: '/users', icon: Users, roles: ['admin', 'superadmin'] },
    { name: 'Fields', href: '/fields', icon: Settings, roles: ['admin', 'superadmin'] },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <FileText size={18} />
            </div>
            LeadManager
          </h1>
          <p className="text-xs text-gray-500 mt-1 capitalize">{role}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.filter(l => l.roles.includes(role || '')).map((link) => (
            <NavLink
              key={link.name}
              to={link.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <link.icon size={18} />
              {link.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {/* Breadcrumb or Page Title could go here */}
            Welcome, {user.user_metadata?.name || user.email}
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {user.email[0].toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
