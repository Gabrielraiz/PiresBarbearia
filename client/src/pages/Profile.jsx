import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import Icons from '../components/Icons';
import api from '../api';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const lang = settings.language === 'en';

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [tab, setTab] = useState('info');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
    setPhotoPreview(user.photo || '');
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target.result);
      api.put('/auth/photo', { photo: ev.target.result }).then(() => {
        updateUser({ ...user, photo: ev.target.result });
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage('');
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data);
      setMessage(lang ? 'Profile updated!' : 'Perfil atualizado!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage(lang ? 'Passwords do not match' : 'Senhas não coincidem');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await api.put('/auth/change-password', passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage(lang ? 'Password changed!' : 'Senha alterada!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erro');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-4xl mx-auto min-h-screen bg-[var(--bg-main)]">
      <div className="mb-12 text-center md:text-left">
        <h1 className="font-display font-black text-5xl md:text-6xl text-[var(--text-primary)] tracking-tighter mb-4 uppercase italic">
          {lang ? 'MY' : 'MEU'} <span className="text-[var(--gold)]">PERFIL</span>
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="h-1 w-20 bg-[var(--gold)] rounded-full" />
          <p className="text-[var(--text-secondary)] font-medium tracking-[0.3em] text-xs uppercase">
            {lang ? 'MANAGE YOUR PERSONAL SETTINGS' : 'GERENCIE SUAS CONFIGURAÇÕES PESSOAIS'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Profile Card */}
        <div className="lg:col-span-4">
          <div className="card p-8 bg-[var(--bg-card)] border-[var(--border)] text-center shadow-2xl relative overflow-hidden group">
            {/* Background Decorative */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] opacity-10 group-hover:opacity-20 transition-opacity" />
            
            <div className="relative z-10">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-[2.5rem] bg-[var(--bg-main)] border-2 border-[var(--border)] group-hover:border-[var(--gold)] overflow-hidden transition-all duration-500 shadow-2xl">
                  {photoPreview ? (
                    <img src={photoPreview} alt={user?.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--gold)] font-display font-black text-5xl italic bg-[var(--bg-main)]">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-[var(--gold)] text-black flex items-center justify-center cursor-pointer shadow-xl hover:bg-white transition-all hover:scale-110 active:scale-95 border-4 border-[var(--bg-card)]">
                  <Icons.Camera size={20} />
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
              </div>

              <h2 className="font-display font-black text-2xl text-[var(--text-primary)] uppercase tracking-tighter mb-1 italic">
                {user?.name}
              </h2>
              <p className="text-[var(--text-secondary)] text-xs font-medium mb-4 italic">{user?.email}</p>
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 text-[var(--gold)] text-[10px] font-black tracking-widest uppercase italic">
                {user?.role === 'admin' ? 'ADMIN MASTER' : (user?.role_label || 'MEMBRO CLUB')}
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-[var(--border)] flex flex-col gap-3">
              <button 
                onClick={() => { logout(); navigate('/'); }}
                className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] text-red-500 font-black text-[10px] tracking-[0.2em] uppercase hover:bg-red-500 hover:text-white transition-all shadow-lg group/logout"
              >
                <Icons.LogOut size={16} className="group-hover/logout:-translate-x-1 transition-transform" />
                {lang ? 'SIGN OUT' : 'SAIR DA CONTA'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex gap-4 mb-2 p-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-fit">
            {[
              { key: 'info', label: lang ? 'Personal' : 'Dados', icon: <Icons.User size={16} /> },
              { key: 'password', label: lang ? 'Security' : 'Segurança', icon: <Icons.Lock size={16} /> },
            ].map(t => (
              <button 
                key={t.key} 
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-3 px-6 py-3 text-[10px] font-black tracking-widest uppercase rounded-xl transition-all ${
                  tab === t.key 
                    ? 'bg-[var(--gold)] text-black shadow-lg' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {message && (
            <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${
              message.includes('!') 
                ? 'bg-green-500/10 border border-green-500/20 text-green-500' 
                : 'bg-red-500/10 border border-red-500/20 text-red-500'
            }`}>
              <Icons.Info size={18} />
              {message.toUpperCase()}
            </div>
          )}

          <div className="card p-8 md:p-10 bg-[var(--bg-card)] border-[var(--border)] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {tab === 'info' && (
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase italic ml-1">
                      <Icons.Type size={14} className="text-[var(--gold)]" /> {lang ? 'FULL NAME' : 'NOME COMPLETO'}
                    </label>
                    <input 
                      value={form.name} 
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] text-sm focus:border-[var(--gold)]/50 transition-all outline-none font-bold" 
                      placeholder="Seu nome" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase italic ml-1">
                      <Icons.Mail size={14} className="text-[var(--gold)]" /> {lang ? 'EMAIL ADDRESS' : 'E-MAIL DE ACESSO'}
                    </label>
                    <input 
                      type="email" 
                      value={form.email} 
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] text-sm focus:border-[var(--gold)]/50 transition-all outline-none font-bold" 
                      placeholder="seu@email.com" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase italic ml-1">
                      <Icons.Phone size={14} className="text-[var(--gold)]" /> {lang ? 'PHONE NUMBER' : 'TELEFONE / WHATSAPP'}
                    </label>
                    <input 
                      value={form.phone} 
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] text-sm focus:border-[var(--gold)]/50 transition-all outline-none font-mono" 
                      placeholder="(49) 99999-9999" 
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSaveProfile} 
                  disabled={saving} 
                  className="w-full group relative py-5 bg-[var(--gold)] text-black font-black text-[10px] tracking-[0.3em] uppercase rounded-2xl transition-all duration-500 shadow-xl shadow-[var(--gold)]/10 active:scale-95 disabled:opacity-50 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {saving ? <Icons.RefreshCw size={18} className="animate-spin" /> : <Icons.Check size={18} />}
                    {saving ? (lang ? 'SAVING...' : 'SALVANDO...') : (lang ? 'CONFIRM CHANGES' : 'CONFIRMAR ALTERAÇÕES')}
                  </span>
                </button>
              </div>
            )}

            {tab === 'password' && (
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase italic ml-1">
                      <Icons.Lock size={14} className="text-[var(--gold)]" /> {lang ? 'CURRENT PASSWORD' : 'SENHA ATUAL'}
                    </label>
                    <div className="relative">
                      <input 
                        type={showCurrent ? 'text' : 'password'} 
                        value={passwordForm.currentPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] text-sm focus:border-[var(--gold)]/50 transition-all outline-none font-mono tracking-widest" 
                      />
                      <button 
                        onClick={() => setShowCurrent(!showCurrent)} 
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]/30 hover:text-[var(--gold)] transition-colors"
                      >
                        {showCurrent ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase italic ml-1">
                        <Icons.Zap size={14} className="text-[var(--gold)]" /> {lang ? 'NEW PASSWORD' : 'NOVA SENHA'}
                      </label>
                      <div className="relative">
                        <input 
                          type={showNew ? 'text' : 'password'} 
                          value={passwordForm.newPassword}
                          onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] text-sm focus:border-[var(--gold)]/50 transition-all outline-none font-mono tracking-widest" 
                        />
                        <button 
                          onClick={() => setShowNew(!showNew)} 
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]/30 hover:text-[var(--gold)] transition-colors"
                        >
                          {showNew ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase italic ml-1">
                        <Icons.ShieldCheck size={14} className="text-[var(--gold)]" /> {lang ? 'CONFIRM' : 'CONFIRMAR'}
                      </label>
                      <input 
                        type="password" 
                        value={passwordForm.confirmPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] text-sm focus:border-[var(--gold)]/50 transition-all outline-none font-mono tracking-widest" 
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleChangePassword} 
                  disabled={saving} 
                  className="w-full group relative py-5 bg-[var(--gold)] text-black font-black text-[10px] tracking-[0.3em] uppercase rounded-2xl transition-all duration-500 shadow-xl shadow-[var(--gold)]/10 active:scale-95 disabled:opacity-50 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {saving ? <Icons.RefreshCw size={18} className="animate-spin" /> : <Icons.Lock size={18} />}
                    {saving ? (lang ? 'CHANGING...' : 'ALTERANDO...') : (lang ? 'UPDATE PASSWORD' : 'ATUALIZAR SENHA')}
                  </span>
                </button>
              </div>
            )}
          </div>
          
          {/* Support Info */}
          <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-medium flex items-start gap-4 leading-relaxed shadow-lg shadow-blue-500/5 italic">
            <Icons.Info size={20} className="shrink-0 mt-0.5 text-blue-500" />
            <p>
              {lang 
                ? 'Your profile data is protected. Photo updates are processed instantly across the platform. If you encounter any issues, please contact our master barber support.'
                : 'Seus dados de perfil estão protegidos. Atualizações de foto são processadas instantaneamente em toda a plataforma. Em caso de dúvidas, entre em contato com o suporte master.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
