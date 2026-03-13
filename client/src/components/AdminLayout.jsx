import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import Icons from './Icons';

export default function AdminLayout() {
  const { user, logout, loading } = useAuth();
  const { settings, toggleTheme, t, labels, modules } = useSettings();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const adminNav = [
    { to: '/admin', icon: Icons.Home, label: labels.dashboard, exact: true },
    { to: '/admin/schedule', icon: Icons.Calendar, label: labels.schedule, enabled: modules.booking },
    { to: '/admin/clients', icon: Icons.Users, label: labels.clients },
    { to: '/admin/barbers', icon: Icons.User, label: labels.professionals, enabled: modules.team },
    { to: '/admin/services', icon: Icons.Scissors, label: labels.services, enabled: modules.services },
    { to: '/admin/media', icon: Icons.Image, label: labels.media, enabled: modules.gallery },
    { to: '/admin/reports', icon: Icons.BarChart, label: labels.reports, enabled: modules.reviews || modules.services },
    { to: '/admin/blockouts', icon: Icons.CalendarX, label: labels.blockouts, enabled: modules.booking },
    { to: '/admin/promotions', icon: Icons.Tag, label: labels.promotions },
    { to: '/admin/partners', icon: Icons.Handshake, label: labels.partners },
    { to: '/admin/loyalty', icon: Icons.Loyalty || labels.loyalty, label: labels.loyalty },
    { to: '/admin/settings', icon: Icons.Settings, label: labels.settings },
  ];

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      logout();
      navigate('/admin/login');
    }
  }, [user, loading, logout, navigate]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[var(--bg-main)]">
        <Icons.RefreshCw size={48} className="text-[var(--gold)] animate-spin mb-6" />
        <p className="text-[var(--text-secondary)] font-black tracking-[0.4em] uppercase text-xs">{t('VERIFICANDO ACESSO...', 'CHECKING ACCESS...')}</p>
      </div>
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden ${settings.theme === 'dark' ? 'bg-[#0d0d0d]' : 'bg-[#f5f5f7]'} font-sans`}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/80 z-[60] lg:hidden backdrop-blur-sm transition-all duration-500" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-[70] w-72 bg-[var(--bg-card)] border-r border-[var(--border)] flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 mb-4">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/admin')}>
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center shadow-2xl shadow-[var(--gold)]/20 group-hover:scale-110 transition-transform duration-500">
              <Icons.Shield size={24} className="text-black" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[var(--bg-card)] rounded-full animate-pulse" />
            </div>
            <div>
              <p className="font-display font-black text-[var(--text-primary)] text-xl tracking-tighter uppercase leading-none group-hover:text-[var(--gold)] transition-colors">PIRESQK</p>
              <p className="text-[10px] text-[var(--text-secondary)] font-black tracking-[0.3em] uppercase mt-1">{t('SISTEMA PRO', 'PRO SYSTEM')}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-black text-[var(--text-secondary)]/30 tracking-[0.3em] uppercase mb-4">{t('PRINCIPAL', 'MAIN')}</p>
          {adminNav.filter(item => item.enabled !== false).map(({ to, icon: Icon, label, exact }) => (
            <NavLink 
              key={to} 
              to={to} 
              end={exact}
              className={({ isActive }) => {
                const base = "group flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300";
                const activeClass = "bg-[var(--gold)] text-black shadow-xl shadow-[var(--gold)]/20 scale-[1.02]";
                const inactiveClass = "text-[var(--text-secondary)] hover:bg-[var(--gold)]/10 hover:text-[var(--text-primary)]";
                return isActive ? `${base} ${activeClass}` : `${base} ${inactiveClass}`;
              }}
              onClick={() => setSidebarOpen(false)}
            >
              <div className={`transition-transform duration-300 group-hover:scale-110 ${window.location.pathname === to ? 'scale-110' : ''}`}>
                {Icon ? <Icon size={20} /> : null}
              </div>
              <span className="text-xs font-black tracking-[0.1em] uppercase">{label}</span>
              {window.location.pathname === to && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-black/40" />
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-[var(--border)] space-y-3 bg-[var(--bg-main)]/30">
          <button 
            onClick={toggleTheme} 
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--gold)]/50 hover:text-[var(--text-primary)] transition-all shadow-lg active:scale-95"
          >
            <div className="text-[var(--gold)]">
              {settings.theme === 'dark' ? <Icons.Sun size={20} /> : <Icons.Moon size={20} />}
            </div>
            <span className="text-[10px] font-black tracking-[0.2em] uppercase">{settings.theme === 'dark' ? t('MODO CLARO', 'LIGHT MODE') : t('MODO ESCURO', 'DARK MODE')}</span>
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <NavLink to="/" className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--gold)] transition-all shadow-md group">
              <Icons.Eye size={18} className="group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-black tracking-widest uppercase">{t('SITE', 'SITE')}</span>
            </NavLink>
            <button 
              onClick={() => { logout(); navigate('/'); }}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-red-500 hover:border-red-500/30 transition-all shadow-md group"
            >
              <Icons.LogOut size={18} className="group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-black tracking-widest uppercase">{t('SAIR', 'EXIT')}</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-[var(--bg-card)]/80 backdrop-blur-xl border-b border-[var(--border)] flex items-center px-8 gap-6 shadow-xl relative z-50">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--gold)] transition-all"
          >
            <Icons.Menu size={24} />
          </button>
          
          <div className="flex-1 hidden md:block">
            <div className="flex items-center gap-3">
              <div className="h-4 w-1 bg-[var(--gold)] rounded-full" />
              <h2 className="font-display font-black text-sm text-[var(--text-primary)] tracking-[0.2em] uppercase">
                {t('SISTEMA OPERACIONAL', 'OPERATIONS SYSTEM')} <span className="text-[var(--gold)]">{settings.site_name?.split(' ')[0] || 'PIRESQK'}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[var(--text-primary)] text-sm font-black tracking-tight leading-none uppercase">{user.name}</span>
              <span className="text-[var(--gold)] text-[8px] uppercase font-black tracking-[0.3em] mt-1.5">{t('ADMINISTRADOR MASTER', 'MASTER ADMIN')}</span>
            </div>
            <div className="relative group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center text-black font-black text-xl shadow-2xl shadow-[var(--gold)]/30 group-hover:scale-110 transition-transform duration-500 cursor-pointer">
                {user.name?.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[var(--bg-card)] rounded-full" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--bg-main)]">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
