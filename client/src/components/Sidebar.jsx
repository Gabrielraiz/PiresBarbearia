import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Icons } from './Icons';
import api from '../api';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (user) {
      api.get('/notifications').then(r => {
        setNotifications(r.data);
        setUnread(r.data.filter(n => !n.read).length);
      }).catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose?.();
  };

  const navItems = [
    { to: '/', icon: Icons.Home, label: settings.language === 'en' ? 'Home' : 'Início' },
    { to: '/booking', icon: Icons.Calendar, label: settings.language === 'en' ? 'Book Now' : 'Agendar' },
    { to: '/services', icon: Icons.Scissors, label: settings.language === 'en' ? 'Services' : 'Serviços' },
    { to: '/team', icon: Icons.Users, label: settings.language === 'en' ? 'Team' : 'Equipe' },
    { to: '/gallery', icon: Icons.Image, label: settings.language === 'en' ? 'Gallery' : 'Galeria' },
    { to: '/contact', icon: Icons.MapPin, label: settings.language === 'en' ? 'Contact' : 'Contato' },
  ];

  const authItems = user ? [
    { to: '/my-appointments', icon: Icons.Calendar, label: settings.language === 'en' ? 'My Bookings' : 'Meus Agendamentos' },
    { to: '/profile', icon: Icons.User, label: settings.language === 'en' ? 'Profile' : 'Perfil' },
  ] : [];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={onClose} />
      )}
      <aside className={`sidebar fixed left-0 top-0 h-full w-64 z-40 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-5 border-b border-[#2a2a2a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.site_logo ? (
              <img src={settings.site_logo} alt="Logo" className="w-10 h-10 object-contain" />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-[#f5b800] flex items-center justify-center">
                <Icons.Scissors size={18} className="text-black" />
              </div>
            )}
            <div>
              <p className="font-display font-bold text-white text-sm leading-tight uppercase">
                {settings.site_name?.split(' ')[0] || 'PIRESQK'}
              </p>
              <p className="text-[10px] text-[#a0a0a0] tracking-widest uppercase">
                {settings.site_name?.split(' ').slice(1).join(' ') || 'BARBERSHOP'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-[#a0a0a0] hover:text-white">
            <Icons.X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => onClose?.()}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}

          {user && (
            <>
              <div className="border-t border-[#2a2a2a] my-3" />
              {authItems.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} onClick={() => onClose?.()}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <Icon size={18} />
                  <span>{label}</span>
                  {to === '/my-appointments' && unread > 0 && (
                    <span className="ml-auto bg-[#f5b800] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{unread}</span>
                  )}
                </NavLink>
              ))}
            </>
          )}

          {!user && (
            <>
              <div className="border-t border-[#2a2a2a] my-3" />
              <NavLink to="/login" onClick={() => onClose?.()}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Icons.User size={18} />
                <span>{settings.language === 'en' ? 'Login' : 'Entrar'}</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-[#2a2a2a] space-y-3">
          {user && (
            <div className="flex items-center gap-3 p-2">
              <div className="w-9 h-9 rounded-full bg-[#2a2a2a] overflow-hidden flex-shrink-0">
                {user.photo ? (
                  <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#f5b800] font-bold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-[#a0a0a0] truncate">{user.email}</p>
              </div>
            </div>
          )}

          <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
            <p className="text-xs text-[#a0a0a0] mb-1">SUPORTE</p>
            <div className="flex items-center gap-2 text-[#f5b800] text-sm">
              <Icons.Phone size={14} />
              <span>{settings.phone || '(49) 99918-3044'}</span>
            </div>
          </div>

          {user?.role === 'admin' && (
            <NavLink to="/admin" onClick={() => onClose?.()}
              className="btn-outline w-full py-2 text-center text-xs block">
              PAINEL ADMIN
            </NavLink>
          )}

          {user && (
            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 text-[#a0a0a0] hover:text-red-400 text-sm transition-colors">
              <Icons.LogOut size={16} />
              <span>{settings.language === 'en' ? 'Logout' : 'Sair'}</span>
            </button>
          )}

          {!user && (
            <NavLink to="/admin/login" onClick={() => onClose?.()}
              className="btn-outline w-full py-2 text-center text-xs block">
              ACESSAR ADMIN
            </NavLink>
          )}
        </div>
      </aside>
    </>
  );
}
