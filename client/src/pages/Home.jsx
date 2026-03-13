import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import Icons from '../components/Icons';
import PageSkeleton from '../components/PageSkeleton';
import { fetchWithCache } from '../lib/requestCache';
import { getApiErrorMessage } from '../lib/apiError';
import api from '../api';

export default function Home() {
  const { settings, t, labels } = useSettings();
  const lang = settings.language;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loadingServices, setLoadingServices] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [promotions, setPromotions] = useState([]);
  const [loadingPromos, setLoadingPromos] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get('/promotions').then(r => {
      if (mounted) setPromotions(r.data);
    }).finally(() => {
      if (mounted) setLoadingPromos(false);
    });
    
    fetchWithCache('services:list', async () => {
      const response = await api.get('/services');
      return response.data;
    }, 60000).then((servicesData) => {
      if (!mounted) return;
      setServices(servicesData);
    }).catch((err) => {
      if (!mounted) return;
      setErrorMessage(getApiErrorMessage(err, 'Não foi possível carregar os serviços.'));
    }).finally(() => {
      if (mounted) setLoadingServices(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  const getServiceIcon = (icon) => {
    const map = { scissors: Icons.Scissors, package: Icons.Package, eye: Icons.Eye, users: Icons.Users };
    const Ic = map[icon] || Icons.Scissors;
    return <Ic size={22} className="text-[#f5b800]" />;
  };

  const heroStyle = {
    minHeight: '600px',
    ...(settings.hero_bg
      ? {
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.8)), url(${settings.hero_bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }
      : {
          background: settings.theme === 'dark' 
            ? 'radial-gradient(ellipse at 50% 0%, rgba(245, 184, 0, 0.15) 0%, transparent 70%), #0d0d0d'
            : 'radial-gradient(ellipse at 50% 0%, rgba(245, 184, 0, 0.1) 0%, transparent 70%), #f5f5f7'
        }),
  };

  return (
    <div className={`min-h-screen animate-in fade-in duration-700 ${settings.theme === 'dark' ? 'bg-[#0d0d0d]' : 'bg-[#f5f5f7]'}`}>
      <section className="relative overflow-hidden flex items-center justify-center text-center py-20" style={heroStyle}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-10 w-96 h-96 rounded-full opacity-20 blur-[100px]" style={{ background: 'var(--gold)' }} />
          <div className="absolute bottom-0 left-10 w-96 h-96 rounded-full opacity-10 blur-[100px]" style={{ background: 'var(--gold)' }} />
          
          {settings.site_logo && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl opacity-5 pointer-events-none select-none overflow-hidden">
              <img src={settings.site_logo} alt="" className="w-full h-auto grayscale brightness-200 scale-150 rotate-12" />
            </div>
          )}
        </div>

        <div className="relative z-10 px-6 max-w-4xl">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-black/60 border border-[var(--gold)]/40 text-[var(--gold)] text-[11px] font-black mb-10 tracking-[0.4em] backdrop-blur-xl uppercase italic shadow-2xl shadow-[var(--gold)]/20">
            <Icons.Scissors size={16} className="animate-pulse" /> {settings.site_name || `PIRESQK ${labels.industry.toUpperCase()}`}
          </div>
          
          <div className="mb-10 relative">
            {settings.site_logo && (
              <img src={settings.site_logo} alt="Logo" className="w-32 h-32 mx-auto mb-8 drop-shadow-[0_0_30px_rgba(245,184,0,0.5)] transition-transform hover:scale-110 duration-500" />
            )}
            <h1 className="font-display text-7xl md:text-9xl leading-none mb-6 italic font-black tracking-tighter uppercase">
              <span className={settings.theme === 'dark' ? 'text-white drop-shadow-2xl' : 'text-[#1a1a1a] drop-shadow-sm'}>PIRESQK</span><br/>
              <span className="text-[var(--gold)] drop-shadow-[0_0_20px_rgba(245,184,0,0.6)]">{labels.industry.toUpperCase()}</span>
            </h1>
          </div>

          <div className="max-w-2xl mx-auto mb-12">
            <p className={`text-lg md:text-2xl font-medium leading-relaxed italic ${settings.theme === 'dark' ? 'text-[#a0a0a0]' : 'text-[#4b5563]'}`}>
              "{settings.site_tagline || 'Transformando visual em identidade. Onde cada corte é uma obra de arte.'}"
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 mb-16">
            <button onClick={() => navigate('/booking')} className="btn-gold px-12 py-5 text-sm font-black uppercase tracking-[0.25em] shadow-[0_0_40px_rgba(245,184,0,0.3)] hover:shadow-[#f5b800]/60 transition-all italic transform hover:-translate-y-1">
              {labels.book_now?.toUpperCase()}
            </button>
            <div className="flex gap-3">
              {[
                { icon: Icons.Instagram, href: settings.instagram },
                { icon: Icons.Phone, href: `tel:${settings.phone}` },
                { icon: Icons.MapPin, to: '/contact' }
              ].map((item, i) => (
                item.to ? (
                  <Link key={i} to={item.to} className="w-14 h-14 rounded-2xl glass flex items-center justify-center text-[var(--text-primary)] hover:text-[var(--gold)] hover:border-[var(--gold)]/50 transition-all hover:scale-110 shadow-xl">
                    <item.icon size={22} />
                  </Link>
                ) : (
                  <a key={i} href={item.href} target="_blank" rel="noreferrer" className="w-14 h-14 rounded-2xl glass flex items-center justify-center text-[var(--text-primary)] hover:text-[var(--gold)] hover:border-[var(--gold)]/50 transition-all hover:scale-110 shadow-xl">
                    <item.icon size={22} />
                  </a>
                )
              ))}
            </div>
          </div>
          
          <div className={`flex flex-wrap items-center justify-center gap-10 text-[11px] font-black tracking-[0.3em] uppercase ${settings.theme === 'dark' ? 'text-[#a0a0a0]' : 'text-[#6b7280]'}`}>
            <div className="flex items-center gap-3 group">
              <Icons.Shield size={18} className="text-[var(--gold)] group-hover:scale-125 transition-transform" />
              <span>{t('Ambiente Seguro', 'Safe Environment', 'Ambiente Seguro', 'Environnement Sûr', 'Sichere Umgebung', 'Ambiente Sicuro')}</span>
            </div>
            <div className="flex items-center gap-3 group">
              <Icons.Check size={18} className="text-[var(--gold)] group-hover:scale-125 transition-transform" />
              <span>{t('Profissionais Elite', 'Elite Professionals', 'Profesionales de Élite', 'Professionnels d\'Élite', 'Elite-Profis', 'Professionisti d\'Elite')}</span>
            </div>
          </div>
        </div>
        
        <div className={`absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[var(--bg-main)] to-transparent`} />
      </section>

      <div className="px-4 md:px-12 py-24 max-w-7xl mx-auto relative z-20">
        {errorMessage && (
          <div className="mb-12 p-5 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-4 backdrop-blur-xl">
            <Icons.AlertCircle size={20} />
            {errorMessage}
          </div>
        )}
        
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          <div className="lg:col-span-7 w-full">
            <div className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-1.5 bg-[var(--gold)] rounded-full" />
                <span className="text-[var(--gold)] font-black tracking-[0.4em] text-xs uppercase italic">{t('Estilo Premium', 'Premium Style')}</span>
              </div>
              <h2 className={`font-display font-black text-6xl md:text-8xl leading-none tracking-tighter uppercase italic ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>
                {`${t('Nossos', 'Our')} `}
                <span className="text-[var(--gold)]">{labels.services.toUpperCase()}</span>
              </h2>
              <p className={`text-sm mt-6 tracking-[0.3em] font-black uppercase italic ${settings.theme === 'dark' ? 'text-[#a0a0a0]' : 'text-[#6b7280]'}`}>{t('SELECIONE O SEU ESTILO', 'SELECT YOUR STYLE')}</p>
            </div>

            {loadingServices ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-[var(--bg-card)] rounded-[2.5rem] animate-pulse" />)}
              </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {services.map(service => (
                <div key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className={`group relative p-10 bg-[var(--bg-card)] border-[var(--border)] rounded-[2.5rem] transition-all duration-500 cursor-pointer overflow-hidden
                    ${selectedService?.id === service.id 
                      ? 'border-[var(--gold)] shadow-[0_0_50px_rgba(245,184,0,0.15)] ring-2 ring-[var(--gold)]/20' 
                      : 'hover:border-[var(--gold)]/40 hover:shadow-2xl shadow-black/20'}`}>
                  
                  <div className="absolute top-0 right-0 p-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 
                      ${selectedService?.id === service.id ? 'bg-[var(--gold)] text-black' : 'bg-[var(--bg-main)] text-[var(--gold)] group-hover:bg-[var(--gold)]/10'}`}>
                      {getServiceIcon(service.icon)}
                    </div>
                  </div>

                  <div className="mb-8">
                    <p className={`text-[10px] tracking-[0.3em] font-black mb-1 uppercase italic ${settings.theme === 'dark' ? 'text-[#666]' : 'text-[#9ca3af]'}`}>VALOR</p>
                    <p className={`font-display font-black text-3xl ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>R$ {parseFloat(service.price).toFixed(2)}</p>
                  </div>

                  <h3 className={`font-display font-black text-2xl mb-3 tracking-tighter uppercase italic group-hover:text-[var(--gold)] transition-colors ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>{service.name}</h3>
                  
                  <div className={`flex items-center gap-3 text-xs font-black tracking-widest uppercase mb-10 italic ${settings.theme === 'dark' ? 'text-[#666]' : 'text-[#9ca3af]'}`}>
                    <Icons.Clock size={16} className="text-[var(--gold)]" /> {service.duration} MIN
                  </div>

                  <div className={`flex items-center justify-between px-6 py-4 rounded-2xl transition-all border-2 font-black text-[10px] tracking-[0.2em] uppercase italic
                    ${selectedService?.id === service.id 
                      ? 'bg-[var(--gold)] text-black border-[var(--gold)]' 
                      : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border)] group-hover:border-[var(--gold)] group-hover:text-[var(--gold)]'}`}>
                    <span>{t('SELECIONAR', 'SELECT')}</span>
                    <Icons.ChevronRight size={18} className={selectedService?.id === service.id ? '' : 'group-hover:translate-x-1 transition-transform'} />
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>

          <div className="lg:col-span-5 w-full lg:sticky lg:top-32">
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-1.5 bg-[var(--gold)] rounded-full" />
                <span className="text-[var(--gold)] font-black tracking-[0.4em] text-xs uppercase italic">Booking Step</span>
              </div>
              <h2 className={`font-display font-black text-6xl md:text-8xl leading-none tracking-tighter uppercase italic ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>
                {`${t('RESERVE', 'BOOK')} `}
                <span className="text-[var(--gold)]">{labels.appointment.toUpperCase()}</span>
              </h2>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--gold)]/20 to-transparent rounded-[3.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative card p-12 flex flex-col items-center justify-center min-h-[500px] shadow-3xl bg-[var(--bg-card)] border-[var(--border)] rounded-[3rem] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--gold)] to-transparent" />
                
                {!selectedService ? (
                  <div className="text-center animate-in zoom-in duration-700">
                    <div className="w-24 h-24 rounded-3xl bg-[var(--gold)]/5 flex items-center justify-center text-[var(--gold)] mx-auto mb-10 shadow-inner">
                      <Icons.Scissors size={48} className="animate-bounce" />
                    </div>
                    <h3 className={`font-display font-black text-3xl mb-6 tracking-tighter uppercase italic ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>{t('PRIMEIRO PASSO', 'FIRST STEP')}</h3>
                    <p className={`text-base max-w-64 mx-auto leading-relaxed font-bold italic ${settings.theme === 'dark' ? 'text-[#666]' : 'text-[#9ca3af]'}`}>
                      {t(`Selecione ${labels.service} ao lado para ver horários disponíveis.`, `Select a ${labels.service} on the left to see available times.`)}
                    </p>
                  </div>
                ) : (
                  <div className="w-full animate-in slide-in-from-bottom duration-700">
                    <div className="flex flex-col items-center text-center mb-12 p-8 rounded-[2rem] bg-[var(--bg-main)] border-2 border-[var(--gold)]/20 shadow-inner relative group/card">
                      <div className="w-16 h-16 rounded-2xl bg-[var(--gold)] text-black flex items-center justify-center mb-6 shadow-xl shadow-[var(--gold)]/20">
                        {getServiceIcon(selectedService.icon)}
                      </div>
                      <h4 className="font-display font-black text-[var(--gold)] text-3xl tracking-tighter uppercase italic mb-2">{selectedService.name}</h4>
                      <p className={`text-sm font-black tracking-widest uppercase italic ${settings.theme === 'dark' ? 'text-[#666]' : 'text-[#9ca3af]'}`}>R$ {parseFloat(selectedService.price).toFixed(2)} • {selectedService.duration} min</p>
                      
                      <button onClick={() => setSelectedService(null)} className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-90">
                        <Icons.X size={20} />
                      </button>
                    </div>

                    <button onClick={() => navigate(`/booking?service=${selectedService.id}`)} className="btn-gold w-full py-6 text-sm font-black tracking-[0.3em] uppercase italic shadow-2xl shadow-[var(--gold)]/20 hover:scale-[1.02] active:scale-95 transition-all">
                      {t(`CONTINUAR ${labels.appointment}`.toUpperCase(), `CONTINUE ${labels.appointment}`.toUpperCase())}
                    </button>
                    
                    <div className="flex items-center justify-center gap-4 mt-8">
                      <div className="h-[1px] flex-1 bg-[var(--border)]" />
                      <p className={`text-[10px] font-black tracking-[0.3em] uppercase italic ${settings.theme === 'dark' ? 'text-[#333]' : 'text-[#9ca3af]'}`}>
                        {t('ELITE EXPERIENCE', 'ELITE EXPERIENCE')}
                      </p>
                      <div className="h-[1px] flex-1 bg-[var(--border)]" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Promoções Section */}
        {promotions.length > 0 && (
          <div className="mt-40 animate-in slide-in-from-bottom duration-1000">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-1 bg-[var(--gold)] rounded-full" />
              <span className="text-[var(--gold)] font-black tracking-[0.3em] text-xs uppercase">{t('Vantagens Club', 'Club Benefits')}</span>
            </div>
            <h2 className={`section-title text-5xl mb-12 tracking-tighter uppercase italic font-black ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>
              {t('OFERTAS', 'OFFERS')} <span className="text-[var(--gold)]">{t('EXCLUSIVAS', 'EXCLUSIVE')}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {promotions.map(p => (
                <div key={p.id} className="group relative card p-8 bg-[var(--bg-card)] border-[var(--border)] rounded-[2.5rem] overflow-hidden hover:border-[var(--gold)]/30 transition-all duration-500 shadow-2xl">
                  <div className="absolute top-0 right-0 p-6">
                    <div className="w-12 h-12 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)] group-hover:bg-[var(--gold)] group-hover:text-black transition-all">
                      <Icons.Tag size={20} />
                    </div>
                  </div>
                  <div className="mb-6">
                    <p className="text-[var(--gold)] text-[9px] font-black tracking-[0.3em] uppercase mb-2 italic">
                      {p.discount_type === 'percentage' ? `${p.discount_value}% OFF` : `R$ ${p.discount_value} OFF`}
                    </p>
                    <h3 className="font-display font-black text-2xl text-white tracking-tighter uppercase italic leading-none mb-3">{lang ? (p.title_en || p.title_pt) : p.title_pt}</h3>
                    <p className="text-[var(--text-secondary)] text-xs leading-relaxed italic font-medium line-clamp-2">{lang ? (p.description_en || p.description_pt) : p.description_pt}</p>
                  </div>
                  <button 
                    onClick={() => navigate('/booking')}
                    className="w-full py-4 bg-[var(--bg-main)] border border-[var(--border)] hover:border-[var(--gold)] text-white font-black text-[9px] tracking-[0.3em] uppercase rounded-xl transition-all duration-500 flex items-center justify-center gap-2 italic"
                  >
                    {t('APROVEITAR', 'USE NOW')}
                    <Icons.ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Icons.Scissors, title: 'CORTE DE PRECISÃO', desc: 'Técnicas avançadas para o melhor degradê e acabamento artesanal.' },
              { icon: Icons.Shield, title: 'QUALIDADE ELITE', desc: 'Produtos premium importados e ambiente rigorosamente higienizado.' },
              { icon: Icons.Clock, title: 'PONTUALIDADE', desc: 'Seu tempo é sagrado. Respeitamos rigorosamente cada minuto do seu horário.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-10 flex flex-col items-center text-center group hover:border-[var(--gold)] transition-all duration-500">
                <div className="w-20 h-20 rounded-3xl bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)] mb-8 group-hover:scale-110 group-hover:bg-[var(--gold)] group-hover:text-black transition-all duration-500 shadow-2xl shadow-[var(--gold)]/5">
                  <Icon size={36} />
                </div>
                <h3 className={`font-display font-black text-xl mb-4 tracking-tighter ${settings.theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'}`}>{title}</h3>
                <p className={`text-sm leading-relaxed font-medium ${settings.theme === 'dark' ? 'text-[#a0a0a0]' : 'text-[#6b7280]'}`}>{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-32 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Icons.Package, label: t('COMBO', 'COMBO') },
              { icon: Icons.User, label: t('BARBA', 'BEARD') },
              { icon: Icons.Scissors, label: t('CABELO', 'HAIR') },
              { icon: Icons.Eye, label: t('SOBRANCELHA', 'EYEBROW') },
            ].map(({ icon: Icon, label }) => (
              <Link key={label} to="/services" className="card p-8 flex flex-col items-center gap-4 hover:border-[var(--gold)] transition-all group overflow-hidden">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-[var(--gold)]/5 rounded-full group-hover:scale-[5] transition-transform duration-700" />
                <Icon size={32} className="text-[var(--gold)] relative z-10" />
                <span className={`text-xs font-black tracking-[0.3em] uppercase relative z-10 ${settings.theme === 'dark' ? 'text-[#a0a0a0]' : 'text-[#1a1a1a]'}`}>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
  );
}
