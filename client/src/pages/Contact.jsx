import React, { useEffect, useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import Icons from '../components/Icons';
import GoogleMap from '../components/GoogleMap';
import api from '../api';

export default function Contact() {
  const { settings, t, modules } = useSettings();
  const lang = settings.language === 'en';
  const [hours, setHours] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api.get('/settings/business-hours').then(r => setHours(r.data)).catch(() => {});
  }, []);

  const dayNames = lang
    ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    : ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const handleWhatsApp = (e) => {
    e?.preventDefault();
    const whatsapp = settings.whatsapp || '5549999183044';
    const msg = encodeURIComponent(`Olá! Me chamo ${form.name}. ${form.message || 'Gostaria de mais informações.'}`);
    window.open(`https://wa.me/${whatsapp}?text=${msg}`, '_blank');
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const contacts = [
    { icon: Icons.Phone, label: lang ? 'Phone' : 'Telefone', value: settings.phone || '(49) 99918-3044', href: `tel:${settings.phone?.replace(/\D/g,'')}` },
    { icon: Icons.Whatsapp, label: 'WhatsApp', value: settings.phone || '(49) 99918-3044', href: `https://wa.me/${settings.whatsapp || '5549999183044'}` },
    { icon: Icons.MapPin, label: lang ? 'Address' : 'Endereço', value: settings.address || 'Rua das Flores, 123 - Centro', href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address || 'PiresQK Barbearia')}` },
    { icon: Icons.Instagram, label: 'Instagram', value: `@${settings.instagram?.replace(/.*instagram\.com\//,'').replace(/\/$/,'') || 'piresqkcortes'}`, href: settings.instagram || 'https://instagram.com/piresqkcortes' },
    { icon: Icons.Facebook, label: 'Facebook', value: 'PiresQK Barbearia', href: settings.facebook || 'https://facebook.com/piresqkbarbearia' },
  ];

  return (
    <div className={`p-4 md:p-12 min-h-screen animate-in fade-in duration-700 ${settings.theme === 'dark' ? 'bg-[#0d0d0d]' : 'bg-[#f5f5f7]'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-1 bg-[var(--gold)] rounded-full" />
            <span className="text-[var(--gold)] font-black tracking-[0.3em] text-xs uppercase">{t('Canais de Atendimento', 'Contact Channels')}</span>
          </div>
          <h1 className={`font-display font-black text-6xl md:text-8xl tracking-tighter italic uppercase ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>
            {t('FALE', 'TALK')} <span className="text-[var(--gold)]">{t('CONOSCO', 'TO US')}</span>
          </h1>
          <p className={`text-sm mt-6 font-bold tracking-[0.2em] uppercase italic ${settings.theme === 'dark' ? 'text-[#a0a0a0]' : 'text-[#6b7280]'}`}>
            {t('ESTAMOS PRONTOS PARA TRANSFORMAR SEU VISUAL', 'WE ARE READY TO TRANSFORM YOUR STYLE')}
          </p>
        </div>

        {modules.map && settings.map_embed_url && (
          <div className="mb-20 group">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)] shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Icons.MapPin size={20} />
              </div>
              <h2 className={`font-display font-black text-2xl tracking-tight uppercase italic ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>{t('NOSSA LOCALIZAÇÃO', 'OUR LOCATION')}</h2>
            </div>
            <div className="rounded-[2.5rem] overflow-hidden border border-[var(--border)] shadow-2xl hover:border-[var(--gold)]/30 transition-all duration-700">
              <GoogleMap address={settings.address} zoom={17} height="450px" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-8">
            <div className="card p-10 bg-[var(--bg-card)]/40 backdrop-blur-3xl border border-[var(--border)] shadow-2xl rounded-[3rem] group">
              <h3 className="font-display font-black text-lg text-[var(--gold)] mb-10 tracking-[0.2em] uppercase italic">{lang ? 'CONTACT INFO' : 'INFORMAÇÕES'}</h3>
              <div className="space-y-4">
                {contacts.map(({ icon: Icon, label, value, href }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer"
                    className="flex items-center gap-6 p-5 rounded-[2rem] hover:bg-[var(--gold)]/10 transition-all group/item border border-transparent hover:border-[var(--gold)]/20 shadow-lg hover:shadow-[var(--gold)]/5">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--gold)]/10 flex items-center justify-center flex-shrink-0 group-hover/item:bg-[var(--gold)] group-hover/item:text-black transition-all duration-500 shadow-xl">
                      <Icon size={24} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[10px] font-black tracking-[0.2em] uppercase mb-1 ${settings.theme === 'dark' ? 'text-[#666]' : 'text-[#9ca3af]'}`}>{label}</p>
                      <p className={`text-base font-bold tracking-tight truncate ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>{value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {hours.length > 0 && (
              <div className="card p-10 bg-[var(--bg-card)]/40 backdrop-blur-3xl border border-[var(--border)] shadow-2xl rounded-[3rem]">
                <h3 className="font-display font-black text-lg text-[var(--gold)] mb-10 tracking-[0.2em] uppercase italic">{lang ? 'HOURS' : 'HORÁRIOS'}</h3>
                <div className="space-y-5">
                  {hours.map(h => (
                    <div key={h.day_of_week} className="flex justify-between items-center text-sm group/hour">
                      <span className={`font-black tracking-tight uppercase italic ${settings.theme === 'dark' ? 'text-[#a0a0a0]' : 'text-[#4b5563]'} group-hover/hour:text-[var(--gold)] transition-colors`}>{dayNames[h.day_of_week]}</span>
                      <div className="flex-1 border-b border-dashed border-[var(--border)]/30 mx-4 mb-1" />
                      <span className={`font-black tracking-widest text-[11px] px-3 py-1 rounded-lg ${h.is_closed ? 'bg-red-500/10 text-red-500' : (settings.theme === 'dark' ? 'bg-white/5 text-white' : 'bg-black/5 text-[#1a1a1a]')}`}>
                        {h.is_closed ? (lang ? 'CLOSED' : 'FECHADO') : `${h.open_time} - ${h.close_time}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            <div className="card p-10 md:p-12 relative overflow-hidden bg-[var(--bg-card)]/40 backdrop-blur-3xl border border-[var(--border)] shadow-2xl rounded-[3rem]">
              <div className="absolute top-0 left-0 w-full h-1 bg-[var(--gold)]" />
              <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 rounded-2xl bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)] shadow-inner">
                  <Icons.Send size={24} />
                </div>
                <h3 className="font-display font-black text-2xl text-[var(--text-primary)] tracking-tight uppercase italic">{lang ? 'SEND MESSAGE' : 'ENVIAR MENSAGEM'}</h3>
              </div>

              {sent && (
                <div className="p-6 rounded-[2rem] mb-10 bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-black tracking-widest uppercase flex items-center gap-4 animate-in slide-in-from-top duration-500 shadow-xl">
                  <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg">
                    <Icons.Check size={20} />
                  </div>
                  {lang ? 'Redirecting to WhatsApp...' : 'Redirecionando para o WhatsApp...'}
                </div>
              )}

              <form onSubmit={handleWhatsApp} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { key: 'name', label: lang ? 'YOUR NAME' : 'SEU NOME', type: 'text', placeholder: lang ? 'Ex: John Doe' : 'Ex: João Silva', icon: Icons.User },
                    { key: 'email', label: 'E-MAIL', type: 'email', placeholder: 'seu@email.com', icon: Icons.Mail },
                  ].map(({ key, label, type, placeholder, icon: Icon }) => (
                    <div key={key} className="space-y-3">
                      <label className={`flex items-center gap-2 text-[10px] font-black tracking-[0.3em] uppercase italic ml-1 ${settings.theme === 'dark' ? 'text-[#666]' : 'text-[#9ca3af]'}`}>
                        <Icon size={12} className="text-[var(--gold)]" /> {label}
                      </label>
                      <input 
                        type={type} 
                        value={form[key]} 
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        className="w-full bg-[var(--bg-main)]/50 border border-[var(--border)] rounded-2xl px-6 py-5 text-[var(--text-primary)] text-sm focus:border-[var(--gold)]/50 transition-all outline-none font-bold placeholder:text-[var(--text-secondary)]/20 shadow-inner" 
                        placeholder={placeholder} 
                        required 
                      />
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <label className={`flex items-center gap-2 text-[10px] font-black tracking-[0.3em] uppercase italic ml-1 ${settings.theme === 'dark' ? 'text-[#666]' : 'text-[#9ca3af]'}`}>
                    <Icons.Phone size={12} className="text-[var(--gold)]" /> {lang ? 'PHONE' : 'TELEFONE'}
                  </label>
                  <input 
                    type="tel" 
                    value={form.phone} 
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-[var(--bg-main)]/50 border border-[var(--border)] rounded-2xl px-6 py-5 text-[var(--text-primary)] text-sm focus:border-[var(--gold)]/50 transition-all outline-none font-bold placeholder:text-[var(--text-secondary)]/20 shadow-inner" 
                    placeholder="(00) 00000-0000" 
                  />
                </div>

                <div className="space-y-3">
                  <label className={`flex items-center gap-2 text-[10px] font-black tracking-[0.3em] uppercase italic ml-1 ${settings.theme === 'dark' ? 'text-[#666]' : 'text-[#9ca3af]'}`}>
                    <Icons.MessageSquare size={12} className="text-[var(--gold)]" /> {lang ? 'MESSAGE' : 'MENSAGEM'}
                  </label>
                  <textarea 
                    value={form.message} 
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-[var(--bg-main)]/50 border border-[var(--border)] rounded-[2rem] px-6 py-5 text-[var(--text-primary)] text-sm focus:border-[var(--gold)]/50 transition-all outline-none h-40 resize-none font-medium placeholder:text-[var(--text-secondary)]/20 shadow-inner" 
                    placeholder={lang ? 'How can we help you?' : 'Como podemos te ajudar?'} 
                    required 
                  />
                </div>

                <button 
                  type="submit" 
                  className="group relative w-full bg-[var(--gold)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-main)] text-black font-black text-[11px] tracking-[0.4em] uppercase py-6 rounded-[2rem] transition-all duration-500 shadow-2xl shadow-[var(--gold)]/20 active:scale-95 flex items-center justify-center gap-4 italic"
                >
                  <span className="relative z-10 flex items-center gap-4">
                    {lang ? 'START CONVERSATION' : 'INICIAR ATENDIMENTO'}
                    <Icons.Whatsapp size={20} className="group-hover:rotate-12 transition-transform duration-500" />
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </button>
                
                <p className={`text-center text-[9px] font-black tracking-[0.2em] uppercase italic ${settings.theme === 'dark' ? 'text-[#444]' : 'text-[#9ca3af]'}`}>
                  {t('Tempo médio de resposta: 15 minutos', 'Average response time: 15 minutes')}
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
