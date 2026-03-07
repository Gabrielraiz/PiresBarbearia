import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../../components/Icons';
import api from '../../api';

export default function SetupAdmin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: 'Admin PiresQK',
    email: 'pireskqk@gmail.com',
    phone: '(49) 99918-3044',
    password: 'Yuri2209',
    confirmPassword: 'Yuri2209'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      setError('As senhas não conferem');
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post('/auth/setup-admin', {
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone
      });

      setSuccess('✓ Admin configurado com sucesso! Redirecionando para login...');
      setTimeout(() => {
        navigate('/admin/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao configurar admin');
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
          <h1 className="font-display font-bold text-3xl text-white">SETUP ADMIN</h1>
          <p className="text-[#a0a0a0] text-sm mt-1">Configure suas credenciais de administrador</p>
          <p className="text-[10px] text-[#a0a0a0] tracking-widest mt-1">PIRESQK BARBEARIA</p>
        </div>

        <div className="card p-6">
          {error && (
            <div className="p-3 rounded-lg mb-4 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg mb-4 bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.3)] text-green-400 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">NOME</label>
              <div className="relative">
                <Icons.User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]" />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-dark pl-9"
                  placeholder="Ex: Admin PiresQK"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">E-MAIL</label>
              <div className="relative">
                <Icons.Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-dark pl-9"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">TELEFONE (OPCIONAL)</label>
              <div className="relative">
                <Icons.Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="input-dark pl-9"
                  placeholder="(49) 99918-3044"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">SENHA</label>
              <div className="relative">
                <Icons.Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-dark pl-9 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]"
                >
                  {showPass ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">CONFIRMAR SENHA</label>
              <div className="relative">
                <Icons.Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  className="input-dark pl-9 pr-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3 text-sm mt-4"
            >
              {loading ? 'CONFIGURANDO...' : 'CONFIGURAR ADMIN'}
            </button>
          </form>

          <p className="text-center text-[#a0a0a0] text-xs mt-4">
            Já tem credenciais? <a href="/admin/login" className="text-[#f5b800] hover:underline">Faça login</a>
          </p>
        </div>
      </div>
    </div>
  );
}
