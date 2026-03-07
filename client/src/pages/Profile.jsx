import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Icons } from '../components/Icons';
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
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="page-title text-3xl text-white mb-1">{lang ? 'MY PROFILE' : 'MEU PERFIL'}</h1>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-[#2a2a2a] overflow-hidden border-2 border-[#f5b800]">
              {photoPreview ? (
                <img src={photoPreview} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#f5b800] font-bold text-2xl">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <label className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Icons.Camera size={20} className="text-white" />
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white">{user?.name}</h2>
            <p className="text-[#a0a0a0] text-sm">{user?.email}</p>
            <span className="badge badge-warning mt-1">
              {user?.role === 'admin' ? 'ADMIN' : 'CLIENTE'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-[#2a2a2a] pb-2">
        {[
          { key: 'info', label: lang ? 'Personal Info' : 'Dados Pessoais' },
          { key: 'password', label: lang ? 'Password' : 'Senha' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${tab === t.key ? 'text-[#f5b800] border-b-2 border-[#f5b800]' : 'text-[#a0a0a0]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {message && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${message.includes('!') ? 'bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] text-green-400' : 'bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-red-400'}`}>
          {message}
        </div>
      )}

      {tab === 'info' && (
        <div className="space-y-4">
          <div>
            <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">{lang ? 'FULL NAME' : 'NOME COMPLETO'}</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="input-dark" placeholder="Seu nome" />
          </div>
          <div>
            <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">{lang ? 'EMAIL' : 'E-MAIL'}</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="input-dark" placeholder="seu@email.com" />
          </div>
          <div>
            <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">{lang ? 'PHONE' : 'TELEFONE'}</label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              className="input-dark" placeholder="(00) 00000-0000" />
          </div>
          <button onClick={handleSaveProfile} disabled={saving} className="btn-gold w-full py-3 text-sm">
            {saving ? (lang ? 'SAVING...' : 'SALVANDO...') : (lang ? 'SAVE CHANGES' : 'SALVAR ALTERAÇÕES')}
          </button>
        </div>
      )}

      {tab === 'password' && (
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">{lang ? 'CURRENT PASSWORD' : 'SENHA ATUAL'}</label>
            <input type={showCurrent ? 'text' : 'password'} value={passwordForm.currentPassword}
              onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="input-dark pr-10" />
            <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-8 text-[#a0a0a0]">
              {showCurrent ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
            </button>
          </div>
          <div className="relative">
            <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">{lang ? 'NEW PASSWORD' : 'NOVA SENHA'}</label>
            <input type={showNew ? 'text' : 'password'} value={passwordForm.newPassword}
              onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="input-dark pr-10" />
            <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-8 text-[#a0a0a0]">
              {showNew ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
            </button>
          </div>
          <div>
            <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">{lang ? 'CONFIRM PASSWORD' : 'CONFIRMAR SENHA'}</label>
            <input type="password" value={passwordForm.confirmPassword}
              onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="input-dark" />
          </div>
          <button onClick={handleChangePassword} disabled={saving} className="btn-gold w-full py-3 text-sm">
            {saving ? (lang ? 'CHANGING...' : 'ALTERANDO...') : (lang ? 'CHANGE PASSWORD' : 'ALTERAR SENHA')}
          </button>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-[#2a2a2a]">
        <button onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors">
          <Icons.LogOut size={16} />
          {lang ? 'Logout' : 'Sair da conta'}
        </button>
      </div>
    </div>
  );
}
