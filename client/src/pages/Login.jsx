import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Icons } from '../components/Icons';

export default function Login() {
  const { login } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const lang = settings.language === 'en';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user } = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || (lang ? 'Invalid credentials' : 'Credenciais inválidas'));
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
          <h1 className="font-display font-bold text-3xl text-white">{settings.site_name || 'PIRESQK'}</h1>
          <p className="text-[#a0a0a0] text-sm mt-1">{lang ? 'Sign in to your account' : 'Entre na sua conta'}</p>
        </div>

        <div className="card p-6">
          {error && (
            <div className="p-3 rounded-lg mb-4 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-red-400 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">E-MAIL</label>
              <div className="relative">
                <Icons.Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]" />
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-dark pl-9" placeholder="seu@email.com" required />
              </div>
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">{lang ? 'PASSWORD' : 'SENHA'}</label>
              <div className="relative">
                <Icons.Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]" />
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-dark pl-9 pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]">
                  {showPass ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full py-3 text-sm mt-2">
              {loading ? (lang ? 'SIGNING IN...' : 'ENTRANDO...') : (lang ? 'SIGN IN' : 'ENTRAR')}
            </button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-[#a0a0a0] text-sm">
              {lang ? "Don't have an account?" : 'Não tem conta?'}{' '}
              <Link to="/register" className="text-[#f5b800] hover:underline">
                {lang ? 'Register' : 'Cadastre-se'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
