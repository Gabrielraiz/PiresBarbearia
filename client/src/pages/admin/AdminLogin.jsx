import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icons from '../../components/Icons';
import api from '../../api';

export default function AdminLogin() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [captcha, setCaptcha] = useState({ captchaId: '', challenge: '' });
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const loadCaptcha = async () => {
    try {
      const { data } = await api.get('/security/captcha');
      setCaptcha(data);
      setCaptchaAnswer('');
    } catch {
      setCaptcha({ captchaId: '', challenge: '' });
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user } = await login(form.email, form.password, {
        captcha_id: captcha.captchaId,
        captcha_answer: captchaAnswer,
      });
      if (user.role !== 'admin') {
        logout();
        setError('Acesso restrito a administradores');
        return;
      }
      navigate('/admin');
    } catch (err) {
      logout();
      setError(err.response?.data?.message || 'Credenciais inválidas');
      await loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--gold)] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--gold)] rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-1000">
        <div className="text-center mb-12">
          <div className="relative w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[var(--gold)]/20 group hover:rotate-12 transition-transform duration-500">
            <Icons.Shield size={40} className="text-black" />
            <div className="absolute -inset-1 border-2 border-[var(--gold)]/30 rounded-[2.2rem] animate-pulse" />
          </div>
          <h1 className="font-display font-black text-5xl text-white tracking-tighter uppercase italic leading-none mb-4">
            ADMIN <span className="text-[var(--gold)]">PORTAL</span>
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-8 bg-[var(--gold)]/30" />
            <p className="text-[var(--text-secondary)] text-[10px] font-black tracking-[0.4em] uppercase italic">PIRESQK BARBEARIA</p>
            <div className="h-[1px] w-8 bg-[var(--gold)]/30" />
          </div>
        </div>

        <div className="card p-10 bg-[#141414]/80 backdrop-blur-2xl border border-white/5 shadow-2xl rounded-[2.5rem]">
          {error && (
            <div className="p-4 rounded-2xl mb-8 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
              <Icons.AlertCircle size={16} />
              {error.toUpperCase()}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black tracking-[0.3em] uppercase italic ml-1">
                <Icons.Mail size={12} className="text-[var(--gold)]" /> IDENTIFICAÇÃO (E-MAIL)
              </label>
              <div className="relative group">
                <input 
                  type="email" 
                  value={form.email} 
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 text-white text-sm focus:border-[var(--gold)]/50 focus:ring-1 focus:ring-[var(--gold)]/20 transition-all outline-none placeholder:text-white/20 font-medium" 
                  placeholder="admin@piresqk.com.br" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between text-[var(--text-secondary)] text-[10px] font-black tracking-[0.3em] uppercase italic ml-1">
                <span className="flex items-center gap-2"><Icons.Shield size={12} className="text-[var(--gold)]" /> CAPTCHA</span>
                <button type="button" onClick={loadCaptcha} className="text-[var(--gold)] tracking-normal">TROCAR</button>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/5 bg-black/40 px-4 py-5 text-white font-black tracking-widest flex items-center justify-center">
                  {captcha.challenge || '...'}
                </div>
                <input
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  className="bg-black/40 border border-white/5 rounded-2xl px-4 py-5 text-white text-sm focus:border-[var(--gold)]/50 transition-all outline-none"
                  placeholder="Resposta"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black tracking-[0.3em] uppercase italic ml-1">
                <Icons.Lock size={12} className="text-[var(--gold)]" /> CHAVE DE ACESSO
              </label>
              <div className="relative group">
                <input 
                  type={showPass ? 'text' : 'password'} 
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 text-white text-sm focus:border-[var(--gold)]/50 focus:ring-1 focus:ring-[var(--gold)]/20 transition-all outline-none placeholder:text-white/20 font-mono tracking-widest" 
                  placeholder="••••••••" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-[var(--gold)] transition-colors"
                >
                  {showPass ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="group relative w-full bg-[var(--gold)] hover:bg-white text-black font-black text-xs tracking-[0.3em] uppercase py-6 rounded-2xl transition-all duration-500 shadow-2xl shadow-[var(--gold)]/10 active:scale-95 disabled:opacity-50 overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <Icons.RefreshCw size={18} className="animate-spin" />
                ) : (
                  <>ACESSAR SISTEMA <Icons.ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </span>
            </button>
          </form>
        </div>

        <div className="mt-12 text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-[var(--text-secondary)] hover:text-white text-[10px] font-black tracking-[0.4em] uppercase transition-all flex items-center justify-center gap-3 mx-auto group"
          >
            <Icons.ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> VOLTAR AO SITE
          </button>
        </div>
      </div>
    </div>
  );
}
