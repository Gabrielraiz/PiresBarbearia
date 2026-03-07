import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { Icons } from '../components/Icons';
import api from '../api';

export default function Home() {
  const { settings } = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    api.get('/services').then(r => setServices(r.data)).catch(() => {});
  }, []);

  const lang = settings.language === 'en';

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  const getServiceIcon = (icon) => {
    const map = { scissors: Icons.Scissors, package: Icons.Package, eye: Icons.Eye, users: Icons.Users };
    const Ic = map[icon] || Icons.Scissors;
    return <Ic size={22} className="text-[#f5b800]" />;
  };

  const heroStyle = {
    minHeight: '420px',
    ...(settings.hero_bg
      ? {
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${settings.hero_bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }
      : {}),
  };

  return (
    <div className="min-h-screen">
      <section className="hero-bg relative overflow-hidden" style={heroStyle}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(245,184,0,0.08) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(245,184,0,0.04) 0%, transparent 70%)' }} />
          
          {settings.site_logo && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl opacity-10 pointer-events-none select-none">
              <img src={settings.site_logo} alt="" className="w-full h-auto grayscale brightness-200" />
            </div>
          )}
        </div>

        <div className="relative z-10 px-6 py-10 md:py-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(245,184,0,0.1)] border border-[rgba(245,184,0,0.2)] text-[#f5b800] text-xs font-semibold mb-4 tracking-widest">
            <Icons.Scissors size={12} /> {settings.site_name?.toUpperCase() || 'PIRESQK BARBERSHOP'}
          </div>
          <h1 className="page-title text-5xl md:text-7xl leading-none mb-4 italic font-black">
            <span className="text-[#f5b800]">BARBEARIA</span>
          </h1>
          <div className="w-1 h-16 bg-[#f5b800] inline-block mr-4 align-middle" />
          <p className="text-[#a0a0a0] text-base md:text-lg mb-6 max-w-lg inline-block align-middle">
            {settings.site_tagline || 'Transformando visual em identidade. Onde cada corte é uma obra de arte.'}
          </p>

          <div className="flex items-center gap-3 mb-6">
            <a href={`https://www.instagram.com/${settings.instagram?.replace(/.*instagram\.com\//,'') || 'piresqkcortes'}`} target="_blank" rel="noreferrer"
              className="text-[#a0a0a0] hover:text-[#f5b800] text-xs tracking-widest flex items-center gap-1.5 transition-colors">
              <Icons.Instagram size={14} />
              @{settings.instagram?.replace(/.*instagram\.com\//,'') || 'piresqkcortes'}
            </a>
            <span className="text-[#2a2a2a]">|</span>
            <a href={`tel:${settings.phone}`} className="text-[#a0a0a0] hover:text-[#f5b800] text-xs tracking-widest flex items-center gap-1.5 transition-colors">
              <Icons.Phone size={14} />
              {settings.phone || '(49) 99918-3044'}
            </a>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate('/booking')} className="btn-gold px-6 py-3 text-sm">
              {lang ? 'BOOK NOW' : 'AGENDAR AGORA'}
            </button>
            <Link to="/contact" className="w-10 h-10 rounded-lg border border-[#2a2a2a] flex items-center justify-center text-[#a0a0a0] hover:border-[#f5b800] hover:text-[#f5b800] transition-all">
              <Icons.Instagram size={18} />
            </Link>
            <Link to="/contact" className="w-10 h-10 rounded-lg border border-[#2a2a2a] flex items-center justify-center text-[#a0a0a0] hover:border-[#f5b800] hover:text-[#f5b800] transition-all">
              <Icons.Phone size={18} />
            </Link>
            <Link to="/contact" className="w-10 h-10 rounded-lg border border-[#2a2a2a] flex items-center justify-center text-[#a0a0a0] hover:border-[#f5b800] hover:text-[#f5b800] transition-all">
              <Icons.MapPin size={18} />
            </Link>
          </div>
        </div>
      </section>

      <div className="px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="mb-6">
              <h2 className="section-title text-2xl text-white">
                {lang ? 'OUR ' : 'NOSSOS '}
                <span className="text-[#f5b800]">{lang ? 'SERVICES' : 'SERVIÇOS'}</span>
              </h2>
              <p className="text-[#a0a0a0] text-sm mt-1 tracking-widest">{lang ? 'SELECT YOUR STYLE' : 'SELECIONE O SEU ESTILO'}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map(service => (
                <div key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className={`service-card ${selectedService?.id === service.id ? 'selected' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(245,184,0,0.1)] flex items-center justify-center">
                      {getServiceIcon(service.icon)}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[#a0a0a0] tracking-widest">VALOR</p>
                      <p className="font-display font-bold text-white text-xl">R$ {parseFloat(service.price).toFixed(2)}</p>
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-white text-lg mb-1">{service.name.toUpperCase()}</h3>
                  <div className="flex items-center gap-1 text-[#a0a0a0] text-xs mb-3">
                    <Icons.Clock size={12} /> {service.duration} MIN
                  </div>
                  <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#1a1a1a] text-[#a0a0a0] text-xs hover:bg-[rgba(245,184,0,0.1)] hover:text-[#f5b800] transition-all border border-[#2a2a2a] hover:border-[rgba(245,184,0,0.3)]">
                    <span className="font-semibold tracking-widest">SELECIONAR</span>
                    <Icons.ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-6">
              <h2 className="section-title text-2xl text-white">
                {lang ? 'RESERVE YOUR ' : 'RESERVE SEU '}
                <span className="text-[#f5b800]">{lang ? 'SCHEDULE' : 'HORÁRIO'}</span>
              </h2>
            </div>

            <div className="card p-6 flex flex-col items-center justify-center min-h-64">
              {!selectedService ? (
                <div className="text-center">
                  <div className="scissors-3d mx-auto mb-4">
                    <Icons.Scissors size={36} className="text-black" />
                  </div>
                  <h3 className="font-display font-bold text-white text-lg mb-2">{lang ? 'FIRST STEP' : 'PRIMEIRO PASSO'}</h3>
                  <p className="text-[#a0a0a0] text-sm max-w-48 mx-auto">
                    {lang ? 'Select a service on the left to see available times.' : 'Selecione um serviço ao lado para ver os horários disponíveis.'}
                  </p>
                </div>
              ) : (
                <div className="w-full">
                  <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-[rgba(245,184,0,0.05)] border border-[rgba(245,184,0,0.2)]">
                    <div>
                      <p className="font-display font-bold text-[#f5b800]">{selectedService.name.toUpperCase()}</p>
                      <p className="text-xs text-[#a0a0a0]">R$ {parseFloat(selectedService.price).toFixed(2)} • {selectedService.duration} min</p>
                    </div>
                    <button onClick={() => setSelectedService(null)} className="text-[#a0a0a0] hover:text-white">
                      <Icons.X size={16} />
                    </button>
                  </div>
                  <button onClick={() => navigate(`/booking?service=${selectedService.id}`)} className="btn-gold w-full py-3 text-sm">
                    {lang ? 'CONTINUE BOOKING' : 'CONTINUAR AGENDAMENTO'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Icons.Package, label: lang ? 'COMBO' : 'COMBO' },
            { icon: Icons.User, label: lang ? 'BEARD' : 'BARBA' },
            { icon: Icons.Scissors, label: lang ? 'HAIRCUT' : 'CABELO' },
            { icon: Icons.Eye, label: lang ? 'EYEBROW' : 'SOBRANCELHA' },
          ].map(({ icon: Icon, label }) => (
            <Link key={label} to="/services" className="card p-4 flex flex-col items-center gap-2 hover:border-[rgba(245,184,0,0.3)] transition-all">
              <Icon size={24} className="text-[#f5b800]" />
              <span className="text-xs text-[#a0a0a0] font-semibold tracking-widest">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
