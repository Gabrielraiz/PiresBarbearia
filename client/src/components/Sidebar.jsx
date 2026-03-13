import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import Icons from './Icons';
import api from '../api';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { settings, toggleTheme, setLanguage, t, labels, modules } = useSettings();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [langOpen, setLangOpen] = useState(false);

  const languages = [
    { id: 'pt', label: 'Português', flag: '🇧🇷' },
    { id: 'en', label: 'English', flag: '🇺🇸' },
    { id: 'es', label: 'Español', flag: '🇪🇸' },
    { id: 'fr', label: 'Français', flag: '🇫🇷' },
    { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { id: 'it', label: 'Italiano', flag: '🇮🇹' }
  ];

  const currentLang = languages.find(l => l.id === settings.language) || languages[0];

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
    { to: '/', icon: Icons.Home, label: t('Início', 'Home', 'Inicio', 'Accueil', 'Startseite', 'Inizio') },
    { to: '/booking', icon: Icons.Calendar, label: labels.appointment, enabled: modules.booking },
    { to: '/services', icon: Icons.Scissors, label: labels.services, enabled: modules.services },
    { to: '/team', icon: Icons.Users, label: labels.professionals, enabled: modules.team },
    { to: '/gallery', icon: Icons.Image, label: labels.gallery, enabled: modules.gallery },
    { to: '/promotions', icon: Icons.Tag, label: labels.promotions, enabled: true },
    { to: '/partners', icon: Icons.Handshake, label: labels.partners, enabled: true },
    { to: '/loyalty', icon: Icons.Trophy, label: labels.loyalty, enabled: true },
    { to: '/contact', icon: Icons.MapPin, label: labels.contact, enabled: modules.contact },
  ];

  const authItems = user ? [
    { to: '/my-appointments', icon: Icons.Calendar, label: `${t('Meus', 'My', 'Mis', 'Mes', 'Meine', 'I Miei')} ${labels.appointments}` },
    { to: '/profile', icon: Icons.User, label: labels.profile },
  ] : [];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm transition-all duration-500" onClick={onClose} />
      )}
      <aside className={`fixed left-0 top-0 h-full w-72 z-50 flex flex-col bg-[var(--bg-card)] border-r border-[var(--border)] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-8 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center shadow-2xl shadow-[var(--gold)]/20 group-hover:rotate-6 transition-transform duration-500">
                {settings.site_logo ? (
                  <img src={settings.site_logo} alt="Logo" className="w-8 h-8 object-contain" />
                ) : (
                  <Icons.Scissors size={24} className="text-black" />
                )}
              </div>
              <div>
                <p className="font-display font-black text-[var(--text-primary)] text-xl tracking-tighter uppercase leading-none group-hover:text-[var(--gold)] transition-colors">
                  {settings.site_name?.split(' ')[0] || 'PIRESQK'}
                </p>
                <p className="text-[10px] text-[var(--text-secondary)] font-black tracking-[0.3em] uppercase mt-1">
                  {settings.site_name?.split(' ').slice(1).join(' ') || labels.industry.toUpperCase()}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--gold)] transition-all">
              <Icons.X size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-black text-[var(--text-secondary)]/30 tracking-[0.3em] uppercase mb-4">{t('NAVEGAÇÃO', 'NAVIGATION', 'NAVEGACIÓN', 'NAVIGATION', 'NAVIGATION', 'NAVIGAZIONE')}</p>
          {navItems.filter((item) => item.enabled !== false).map(({ to, icon: Icon, label }) => (
            <NavLink 
              key={to} 
              to={to} 
              end={to === '/'} 
              onClick={() => onClose?.()}
              className={({ isActive }) => {
                const base = "group flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300";
                const activeClass = "bg-[var(--gold)] text-black shadow-xl shadow-[var(--gold)]/20 scale-[1.02]";
                const inactiveClass = "text-[var(--text-secondary)] hover:bg-[var(--gold)]/10 hover:text-[var(--text-primary)]";
                return isActive ? `${base} ${activeClass}` : `${base} ${inactiveClass}`;
              }}
            >
              <div className="transition-transform duration-300 group-hover:scale-110">
                {Icon ? <Icon size={20} /> : null}
              </div>
              <span className="text-xs font-black tracking-[0.1em] uppercase">{label}</span>
              {(to === '/' ? window.location.pathname === '/' : window.location.pathname.startsWith(to)) && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-black/40" />
              )}
            </NavLink>
          ))}

          {user && (
            <>
              <div className="h-[1px] bg-[var(--border)] my-6 mx-4 opacity-50" />
              <p className="px-4 text-[10px] font-black text-[var(--text-secondary)]/30 tracking-[0.3em] uppercase mb-4">{t('MINHA CONTA', 'MY ACCOUNT', 'MI CUENTA', 'MON COMPTE', 'MEIN KONTO', 'IL MIO ACCOUNT')}</p>
              {authItems.map(({ to, icon: Icon, label }) => (
                <NavLink 
                  key={to} 
                  to={to} 
                  onClick={() => onClose?.()}
                  className={({ isActive }) => {
                    const base = "group flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300";
                    const activeClass = "bg-[var(--gold)] text-black shadow-xl shadow-[var(--gold)]/20 scale-[1.02]";
                    const inactiveClass = "text-[var(--text-secondary)] hover:bg-[var(--gold)]/10 hover:text-[var(--text-primary)]";
                    return isActive ? `${base} ${activeClass}` : `${base} ${inactiveClass}`;
                  }}
                >
                  <div className="transition-transform duration-300 group-hover:scale-110">
                    {Icon ? <Icon size={20} /> : null}
                  </div>
                  <span className="text-xs font-black tracking-[0.1em] uppercase flex-1">{label}</span>
                  {to === '/my-appointments' && unread > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-black rounded-lg px-2 py-1 shadow-lg animate-pulse">{unread}</span>
                  )}
                </NavLink>
              ))}
            </>
          )}

          {!user && (
            <>
              <div className="h-[1px] bg-[var(--border)] my-6 mx-4 opacity-50" />
              <NavLink 
                to="/login" 
                onClick={() => onClose?.()}
                className={({ isActive }) => {
                  const base = "group flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300";
                  const activeClass = "bg-[var(--gold)] text-black shadow-xl shadow-[var(--gold)]/20 scale-[1.02]";
                  const inactiveClass = "text-[var(--text-secondary)] hover:bg-[var(--gold)]/10 hover:text-[var(--text-primary)]";
                  return isActive ? `${base} ${activeClass}` : `${base} ${inactiveClass}`;
                }}
              >
                {Icons.User ? <Icons.User size={20} /> : null}
                <span className="text-xs font-black tracking-[0.1em] uppercase">{t('ENTRAR', 'LOGIN')}</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="p-6 border-t border-[var(--border)] space-y-3 bg-[var(--bg-main)]/30">
          {user && (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-md mb-2">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center text-black font-black text-lg shadow-lg">
                {user.photo ? (
                  <img src={user.photo} alt={user.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  user.name?.charAt(0).toUpperCase()
                )}
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[var(--bg-card)] rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-[var(--text-primary)] truncate uppercase tracking-tight">{user.name}</p>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold truncate uppercase tracking-widest">{user.role === 'admin' ? t('ADMIN MASTER', 'ADMIN MASTER') : t('MEMBRO CLUB', 'CLUB MEMBER')}</p>
              </div>
            </div>
          )}

          <button 
            onClick={toggleTheme} 
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--gold)]/50 hover:text-[var(--text-primary)] transition-all shadow-lg active:scale-95"
          >
            <div className="text-[var(--gold)]">
              {settings.theme === 'dark' ? <Icons.Sun size={20} /> : <Icons.Moon size={20} />}
            </div>
            <span className="text-[10px] font-black tracking-[0.2em] uppercase italic">
              {settings.theme === 'dark' ? t('MODO CLARO', 'LIGHT MODE', 'MODO CLARO') : t('MODO ESCURO', 'DARK MODE', 'MODO OSCURO')}
            </span>
          </button>

          <div className="space-y-4 pt-2">
            <button 
              onClick={() => setLangOpen(true)}
              className="w-full flex items-center gap-4 px-6 py-5 rounded-[2rem] bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-main)] border border-[var(--gold)]/20 text-[var(--text-secondary)] hover:border-[var(--gold)] hover:shadow-2xl hover:shadow-[var(--gold)]/10 transition-all duration-500 active:scale-95 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--gold)]/0 via-[var(--gold)]/5 to-[var(--gold)]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="relative z-10 p-2 rounded-xl bg-[var(--gold)] text-black group-hover:rotate-[360deg] transition-transform duration-700">
                <Icons.Globe size={22} />
              </div>
              <div className="relative z-10 flex-1 text-left">
                <p className="text-[9px] font-black tracking-[0.3em] uppercase italic text-[var(--gold)] mb-1 opacity-70">
                  {t('GLOBAL EXPERIENCE', 'GLOBAL EXPERIENCE', 'EXPERIENCIA GLOBAL')}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xl leading-none">{currentLang.flag}</span>
                  <span className="text-xs font-black text-white uppercase tracking-[0.15em]">{currentLang.label}</span>
                </div>
              </div>
              <Icons.ChevronRight size={18} className="relative z-10 text-[var(--gold)] opacity-40 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Language Selection Overlay/Card */}
            {langOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setLangOpen(false)}>
                <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--gold)]/20 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500" onClick={e => e.stopPropagation()}>
                  <div className="p-10 border-b border-[var(--border)] relative overflow-hidden bg-gradient-to-br from-[var(--bg-main)] to-[var(--bg-card)]">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--gold)]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 text-[var(--gold)] mb-4">
                          <div className="w-10 h-10 rounded-2xl bg-[var(--gold)]/10 flex items-center justify-center border border-[var(--gold)]/20 animate-pulse">
                            <Icons.Globe size={22} />
                          </div>
                          <span className="text-[11px] font-black tracking-[0.4em] uppercase italic opacity-80">Premium Access</span>
                        </div>
                        <h3 className="font-display font-black text-3xl text-white tracking-tighter uppercase italic leading-tight">
                          {t('SELECIONE O', 'SELECT THE', 'SELECCIONA EL')} <br />
                          <span className="text-[var(--gold)]">{t('IDIOMA DESEJADO', 'DESIRED LANGUAGE', 'IDIOMA DESEADO')}</span>
                        </h3>
                      </div>
                      <button onClick={() => setLangOpen(false)} className="w-12 h-12 rounded-2xl bg-white/5 text-white flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-300 active:scale-90 group">
                        <Icons.X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-8 grid grid-cols-1 gap-4 bg-[var(--bg-main)]/20">
                    {languages.map((lang) => (
                      <button 
                        key={lang.id}
                        onClick={() => { setLanguage(lang.id); setLangOpen(false); }}
                        className={`flex items-center gap-5 px-7 py-5 rounded-[1.5rem] transition-all duration-500 group relative overflow-hidden
                          ${settings.language === lang.id 
                            ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-black shadow-2xl shadow-[var(--gold)]/30 scale-[1.02] ring-2 ring-[var(--gold)] ring-offset-4 ring-offset-[var(--bg-card)]' 
                            : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--gold)]/50 hover:bg-[var(--bg-main)] hover:translate-x-2'}`}
                      >
                        <span className="text-3xl filter drop-shadow-md group-hover:scale-125 transition-transform duration-500">{lang.flag}</span>
                        <div className="flex-1 text-left">
                          <p className={`text-sm font-black uppercase tracking-[0.1em] ${settings.language === lang.id ? 'text-black' : 'text-white'}`}>{lang.label}</p>
                          <p className={`text-[9px] font-bold uppercase tracking-[0.3em] ${settings.language === lang.id ? 'text-black/70' : 'text-[var(--text-secondary)] opacity-60'}`}>{lang.id}</p>
                        </div>
                        {settings.language === lang.id ? (
                          <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                            <Icons.Check size={20} className="text-black" />
                          </div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-[var(--border)] group-hover:bg-[var(--gold)] transition-colors" />
                        )}
                      </button>
                    ))}
                  </div>
                  
                  <div className="p-8 bg-black/40 text-center border-t border-[var(--border)]">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="h-[1px] w-8 bg-[var(--border)]" />
                      <p className="text-[10px] font-black text-[var(--text-secondary)]/50 tracking-[0.4em] uppercase italic">
                        PiresQK International
                      </p>
                      <div className="h-[1px] w-8 bg-[var(--border)]" />
                    </div>
                    <p className="text-[8px] font-bold text-[var(--text-secondary)]/30 uppercase tracking-[0.2em]">
                      {t('Mude o idioma em tempo real', 'Change language in real time', 'Cambiar el idioma en tiempo real')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {user?.role === 'admin' ? (
            <div />
          ) : !user && (
            <button 
              onClick={() => { navigate('/admin/login'); onClose?.(); }}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-secondary)] font-black text-[10px] tracking-[0.2em] uppercase hover:border-[var(--gold)]/50 hover:text-[var(--gold)] transition-all active:scale-95"
            >
              <Icons.Lock size={18} />
              {t('ACESSAR ADMIN', 'ACCESS ADMIN', 'ACCESO ADMIN')}
            </button>
          )}

          <div className="pt-4 border-t border-[var(--border)] mt-4">
            <p className="text-[9px] font-black text-[var(--text-secondary)]/40 tracking-widest uppercase text-center italic">
              Desenvolvido por <span className="text-[var(--gold)]/60">Gabriel Oliveira da Rocha</span>
            </p>
          </div>

          {user && (
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-all active:scale-95"
            >
              <Icons.LogOut size={20} />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase">{t('SAIR DA CONTA', 'LOGOUT')}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
