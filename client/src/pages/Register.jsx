import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Icons } from '../components/Icons';

export default function Register() {
  const { register } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const lang = settings.language === 'en';

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError(lang ? 'Passwords do not match' : 'Senhas não coincidem');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form.name, form.email, form.phone, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || (lang ? 'Registration failed' : 'Erro ao cadastrar'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#f5b800] flex items-center justify-center mx-auto mb-4">
            <Icons.Scissors size={32} className="text-black" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white">{lang ? 'CREATE ACCOUNT' : 'CRIAR CONTA'}</h1>
          <p className="text-[#a0a0a0] text-sm mt-1">{lang ? 'Join PiresQK Barbershop' : 'Junte-se à PiresQK Barbearia'}</p>
        </div>

        <div className="card p-6">
          {error && (
            <div className="p-3 rounded-lg mb-4 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-red-400 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: lang ? 'FULL NAME' : 'NOME COMPLETO', type: 'text', icon: Icons.User, placeholder: lang ? 'Your name' : 'Seu nome' },
              { key: 'email', label: 'E-MAIL', type: 'email', icon: Icons.Mail, placeholder: 'seu@email.com' },
              { key: 'phone', label: lang ? 'PHONE' : 'TELEFONE', type: 'tel', icon: Icons.Phone, placeholder: '(00) 00000-0000' },
            ].map(({ key, label, type, icon: Icon, placeholder }) => (
              <div key={key}>
                <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">{label}</label>
                <div className="relative">
                  <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]" />
                  <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="input-dark pl-9" placeholder={placeholder} required={key !== 'phone'} />
                </div>
              </div>
            ))}
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">{lang ? 'PASSWORD' : 'SENHA'}</label>
              <div className="relative">
                <Icons.Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]" />
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-dark pl-9 pr-10" placeholder="Mínimo 6 caracteres" required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]">
                  {showPass ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">{lang ? 'CONFIRM PASSWORD' : 'CONFIRMAR SENHA'}</label>
              <div className="relative">
                <Icons.Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]" />
                <input type="password" value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  className="input-dark pl-9" placeholder="••••••••" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full py-3 text-sm mt-2">
              {loading ? (lang ? 'REGISTERING...' : 'CADASTRANDO...') : (lang ? 'CREATE ACCOUNT' : 'CRIAR CONTA')}
            </button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-[#a0a0a0] text-sm">
              {lang ? 'Already have an account?' : 'Já tem conta?'}{' '}
              <Link to="/login" className="text-[#f5b800] hover:underline">
                {lang ? 'Sign in' : 'Entrar'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
