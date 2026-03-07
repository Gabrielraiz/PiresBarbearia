import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Icons } from './Icons';

const adminNav = [
  { to: '/admin', icon: Icons.Home, label: 'Dashboard', exact: true },
  { to: '/admin/schedule', icon: Icons.Calendar, label: 'Agenda' },
  { to: '/admin/clients', icon: Icons.Users, label: 'Clientes' },
  { to: '/admin/barbers', icon: Icons.User, label: 'Barbeiros' },
  { to: '/admin/services', icon: Icons.Scissors, label: 'Serviços' },
  { to: '/admin/media', icon: Icons.Image, label: 'Galeria' },
  { to: '/admin/reports', icon: Icons.BarChart, label: 'Relatórios' },
  { to: '/admin/settings', icon: Icons.Settings, label: 'Configurações' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      logout();
      navigate('/admin/login');
    }
  }, [user, logout, navigate]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0d0d0d]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-60 sidebar flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#f5b800] flex items-center justify-center">
              <Icons.Shield size={16} className="text-black" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-xs">ADMIN PANEL</p>
              <p className="text-[10px] text-[#a0a0a0]">PiresQK Barbearia</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {adminNav.map(({ to, icon: Icon, label, exact }) => (
            <NavLink key={to} to={to} end={exact}
              className={({ isActive }) => `nav-item text-sm ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}>
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-[#2a2a2a] space-y-2">
          <NavLink to="/" className="nav-item text-xs text-[#a0a0a0]">
            <Icons.ChevronLeft size={14} />
            Ver Site
          </NavLink>
          <button onClick={() => { logout(); navigate('/'); }}
            className="nav-item text-xs text-red-400 hover:bg-[rgba(239,68,68,0.1)] w-full">
            <Icons.LogOut size={14} />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-[#111] border-b border-[#2a2a2a] flex items-center px-4 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#a0a0a0] hover:text-white">
            <Icons.Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-sm">
            <div className="w-7 h-7 rounded-full bg-[#f5b800] flex items-center justify-center text-black font-bold text-xs">
              {user.name?.charAt(0)}
            </div>
            <span className="text-[#a0a0a0] hidden sm:block">{user.name}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
