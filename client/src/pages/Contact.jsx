import React, { useEffect, useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Icons } from '../components/Icons';
import GoogleMap from '../components/GoogleMap';
import api from '../api';

export default function Contact() {
  const { settings } = useSettings();
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

  const handleWhatsApp = () => {
    const whatsapp = settings.whatsapp || '5549999183044';
    const msg = encodeURIComponent(`Olá! ${form.message || 'Gostaria de mais informações.'}`);
    window.open(`https://wa.me/${whatsapp}?text=${msg}`, '_blank');
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const contacts = [
    { icon: Icons.Phone, label: lang ? 'Phone' : 'Telefone', value: settings.phone || '(49) 99918-3044', href: `tel:${settings.phone}` },
    { icon: Icons.Whatsapp, label: 'WhatsApp', value: settings.phone || '(49) 99918-3044', href: `https://wa.me/${settings.whatsapp || '5549999183044'}` },
    { icon: Icons.MapPin, label: lang ? 'Address' : 'Endereço', value: settings.address || 'Rua das Flores, 123 - Centro', href: '#' },
    { icon: Icons.Instagram, label: 'Instagram', value: `@${settings.instagram?.replace(/.*instagram\.com\//,'') || 'piresqkcortes'}`, href: settings.instagram || '#' },
    { icon: Icons.Facebook, label: 'Facebook', value: 'PiresQK Barbearia', href: settings.facebook || '#' },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="page-title text-3xl text-white">{lang ? 'CONTACT' : 'CONTATO'}</h1>
        <p className="text-[#a0a0a0] text-sm mt-1">{lang ? 'Get in touch with us' : 'Entre em contato conosco'}</p>
      </div>

      {/* Google Maps */}
      <div className="mb-6">
        <h2 className="section-title text-lg text-white mb-3">{lang ? 'OUR LOCATION' : 'NOSSA LOCALIZAÇÃO'}</h2>
        <GoogleMap address={settings.address || 'Piresqk Barbearia, Brazil'} zoom={17} height="400px" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="section-title text-sm text-[#f5b800] mb-4 tracking-widest">{lang ? 'CONTACT INFO' : 'INFORMAÇÕES'}</h3>
            <div className="space-y-3">
              {contacts.map(({ icon: Icon, label, value, href }) => (
                <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[rgba(245,184,0,0.05)] transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-[rgba(245,184,0,0.1)] flex items-center justify-center flex-shrink-0 group-hover:bg-[rgba(245,184,0,0.2)] transition-colors">
                    <Icon size={16} className="text-[#f5b800]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#a0a0a0]">{label}</p>
                    <p className="text-white text-sm font-medium">{value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {hours.length > 0 && (
            <div className="card p-5">
              <h3 className="section-title text-sm text-[#f5b800] mb-4 tracking-widest">{lang ? 'HOURS' : 'HORÁRIOS'}</h3>
              <div className="space-y-2">
                {hours.map(h => (
                  <div key={h.day_of_week} className="flex justify-between text-sm">
                    <span className="text-[#a0a0a0]">{dayNames[h.day_of_week]}</span>
                    <span className={h.is_closed ? 'text-red-400' : 'text-white'}>
                      {h.is_closed ? (lang ? 'Closed' : 'Fechado') : `${h.open_time} - ${h.close_time}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="section-title text-sm text-[#f5b800] mb-4 tracking-widest">{lang ? 'SEND MESSAGE' : 'ENVIAR MENSAGEM'}</h3>
          {sent && (
            <div className="p-3 rounded-lg mb-4 bg-[rgba(37,211,102,0.1)] border border-[rgba(37,211,102,0.3)] text-green-400 text-sm">
              {lang ? 'Message sent via WhatsApp!' : 'Mensagem enviada pelo WhatsApp!'}
            </div>
          )}
          <div className="space-y-4">
            {[
              { key: 'name', label: lang ? 'Your Name' : 'Seu Nome', type: 'text', placeholder: lang ? 'John Doe' : 'João Silva' },
              { key: 'email', label: 'E-mail', type: 'email', placeholder: 'seu@email.com' },
              { key: 'phone', label: lang ? 'Phone' : 'Telefone', type: 'tel', placeholder: '(00) 00000-0000' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">{label.toUpperCase()}</label>
                <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="input-dark" placeholder={placeholder} />
              </div>
            ))}
            <div>
              <label className="block text-[#a0a0a0] text-xs mb-2 tracking-widest">{lang ? 'MESSAGE' : 'MENSAGEM'}</label>
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                className="input-dark h-28 resize-none" placeholder={lang ? 'Your message...' : 'Sua mensagem...'} />
            </div>
            <button onClick={handleWhatsApp} className="whatsapp-btn w-full justify-center py-3 text-sm">
              <Icons.Whatsapp size={18} />
              {lang ? 'SEND VIA WHATSAPP' : 'ENVIAR VIA WHATSAPP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
