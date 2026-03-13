import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import Icons from '../components/Icons';
import api from '../api';

export default function Register() {
  const { register } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const lang = settings.language === 'en';

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
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
    if (form.password !== form.confirmPassword) {
      setError(lang ? 'Passwords do not match' : 'Senhas não coincidem');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form.name, form.email, form.phone, form.password, {
        captcha_id: captcha.captchaId,
        captcha_answer: captchaAnswer,
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || (lang ? 'Registration failed' : 'Erro ao cadastrar'));
      await loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[var(--bg-main)]">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[var(--gold)] rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[var(--gold)] rounded-full blur-[150px] animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-1000">
        <div className="text-center mb-10">
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[var(--gold)]/20 group hover:rotate-6 transition-transform duration-500">
            <Icons.UserPlus size={36} className="text-black" />
            <div className="absolute -inset-1 border border-[var(--gold)]/30 rounded-[1.8rem] animate-ping opacity-20" />
          </div>
          <h1 className="font-display font-black text-4xl text-[var(--text-primary)] tracking-tighter uppercase italic leading-none mb-3">
            {lang ? 'JOIN THE' : 'JUNTE-SE AO'} <span className="text-[var(--gold)]">CLUB</span>
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-6 bg-[var(--gold)]/30" />
            <p className="text-[var(--text-secondary)] text-[10px] font-black tracking-[0.4em] uppercase italic">
              {lang ? 'NEW MEMBERSHIP' : 'NOVO MEMBRO'}
            </p>
            <div className="h-[1px] w-6 bg-[var(--gold)]/30" />
          </div>
        </div>

        <div className="card p-8 md:p-10 bg-[var(--bg-card)]/40 backdrop-blur-3xl border border-[var(--border)] shadow-2xl rounded-[3rem]">
          {error && (
            <div className="p-4 rounded-2xl mb-8 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black tracking-widest uppercase flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
              <Icons.AlertCircle size={16} />
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'name', label: lang ? 'FULL NAME' : 'NOME COMPLETO', type: 'text', icon: Icons.User, placeholder: 'Ex: John Doe' },
                { key: 'email', label: 'E-MAIL', type: 'email', icon: Icons.Mail, placeholder: 'john@email.com' },
                { key: 'phone', label: lang ? 'PHONE' : 'TELEFONE', type: 'tel', icon: Icons.Phone, placeholder: '(49) 99999-9999' },
              ].map(({ key, label, type, icon: Icon, placeholder }) => (
                <div key={key} className={`space-y-2 ${key === 'name' ? 'md:col-span-2' : ''}`}>
                  <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black tracking-[0.3em] uppercase italic ml-1">
                    <Icon size={12} className="text-[var(--gold)]" /> {label}
                  </label>
                  <input 
                    type={type} 
                    value={form[key]} 
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full bg-[var(--bg-main)]/50 border border-[var(--border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] text-sm focus:border-[var(--gold)]/50 transition-all outline-none placeholder:text-[var(--text-secondary)]/20 font-medium" 
                    placeholder={placeholder} 
                    required={key !== 'phone'} 
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between text-[var(--text-secondary)] text-[10px] font-black tracking-[0.3em] uppercase italic ml-1">
                <span className="flex items-center gap-2"><Icons.Shield size={12} className="text-[var(--gold)]" /> CAPTCHA</span>
                <button type="button" onClick={loadCaptcha} className="text-[var(--gold)] tracking-normal">{lang ? 'Refresh' : 'Trocar'}</button>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-full rounded-2xl border border-[var(--border)] bg-[var(--bg-main)]/50 px-4 py-4 text-[var(--text-primary)] font-black tracking-widest flex items-center justify-center">
                  {captcha.challenge || '...'}
                </div>
                <input
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  className="bg-[var(--bg-main)]/50 border border-[var(--border)] rounded-2xl px-4 py-4 text-[var(--text-primary)] text-sm focus:border-[var(--gold)]/50 transition-all outline-none"
                  placeholder={lang ? 'Answer' : 'Resposta'}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black tracking-[0.3em] uppercase italic ml-1">
                  <Icons.Lock size={12} className="text-[var(--gold)]" /> {lang ? 'PASSWORD' : 'SENHA'}
                </label>
                <div className="relative group">
                  <input 
                    type={showPass ? 'text' : 'password'} 
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-[var(--bg-main)]/50 border border-[var(--border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] text-sm focus:border-[var(--gold)]/50 transition-all outline-none placeholder:text-[var(--text-secondary)]/20 font-mono tracking-widest" 
                    placeholder="••••••" 
                    required 
                    minLength={6} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]/30 hover:text-[var(--gold)] transition-colors"
                  >
                    {showPass ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black tracking-[0.3em] uppercase italic ml-1">
                  <Icons.ShieldCheck size={12} className="text-[var(--gold)]" /> {lang ? 'CONFIRM' : 'CONFIRMAR'}
                </label>
                <input 
                  type="password" 
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full bg-[var(--bg-main)]/50 border border-[var(--border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] text-sm focus:border-[var(--gold)]/50 transition-all outline-none placeholder:text-[var(--text-secondary)]/20 font-mono tracking-widest" 
                  placeholder="••••••" 
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="group relative w-full bg-[var(--gold)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-main)] text-black font-black text-[10px] tracking-[0.3em] uppercase py-5 rounded-2xl transition-all duration-500 shadow-xl shadow-[var(--gold)]/10 active:scale-95 disabled:opacity-50 overflow-hidden mt-4"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <Icons.RefreshCw size={16} className="animate-spin" />
                ) : (
                  <>
                    {lang ? 'CREATE MEMBERSHIP' : 'CRIAR MINHA CONTA'} 
                    <Icons.Check size={16} className="group-hover:scale-125 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-[var(--border)] text-center">
            <p className="text-[var(--text-secondary)] text-[10px] font-black tracking-widest uppercase mb-4">
              {lang ? 'ALREADY A MEMBER?' : 'JÁ É MEMBRO DO CLUB?'}
            </p>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-[var(--gold)] hover:text-[var(--text-primary)] text-xs font-black tracking-[0.2em] uppercase transition-all group"
            >
              {lang ? 'SIGN IN NOW' : 'ENTRAR NA MINHA CONTA'}
              <Icons.LogIn size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="mt-10 text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-[var(--text-secondary)]/40 hover:text-[var(--gold)] text-[9px] font-black tracking-[0.4em] uppercase transition-all flex items-center justify-center gap-3 mx-auto group italic"
          >
            <Icons.ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> 
            {lang ? 'BACK TO HOME' : 'VOLTAR AO INÍCIO'}
          </button>
        </div>
      </div>
    </div>
  );
}
