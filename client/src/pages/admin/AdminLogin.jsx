import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Icons } from '../../components/Icons';

export default function AdminLogin() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
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
      if (user.role !== 'admin') {
        logout();
        setError('Acesso restrito a administradores');
        return;
      }
      navigate('/admin');
    } catch (err) {
      logout();
      setError(err.response?.data?.message || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#f5b800] flex items-center justify-center mx-auto mb-4">
            <Icons.Shield size={32} className="text-black" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white">ADMIN</h1>
          <p className="text-[#a0a0a0] text-sm mt-1">Painel de Administração</p>
          <p className="text-[10px] text-[#a0a0a0] tracking-widest mt-1">PIRESQK BARBEARIA</p>
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
                  className="input-dark pl-9" placeholder="pireskqk@gmail.com" required />
              </div>
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">SENHA</label>
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
              {loading ? 'ENTRANDO...' : 'ACESSAR PAINEL'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
