import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { Icons } from '../components/Icons';
import api from '../api';

export default function Services() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const lang = settings.language === 'en';
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/services').then(r => setServices(r.data));
  }, []);

  const getIcon = (icon) => {
    const map = { scissors: Icons.Scissors, package: Icons.Package, eye: Icons.Eye };
    const Ic = map[icon] || Icons.Scissors;
    return <Ic size={28} className="text-[#f5b800]" />;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="page-title text-3xl text-white">{lang ? 'OUR SERVICES' : 'NOSSOS SERVIÇOS'}</h1>
        <p className="text-[#a0a0a0] text-sm mt-1">{lang ? 'Premium barbershop services' : 'Serviços premium de barbearia'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(s => (
          <div key={s.id} className="service-card cursor-pointer" onClick={() => setSelected(s)}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[rgba(245,184,0,0.1)] flex items-center justify-center">
                {getIcon(s.icon)}
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#a0a0a0] tracking-widest">VALOR</p>
                <p className="font-display font-bold text-2xl text-white">R$ {parseFloat(s.price).toFixed(2)}</p>
              </div>
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-1">{s.name.toUpperCase()}</h3>
            {s.description && <p className="text-[#a0a0a0] text-sm mb-3">{s.description}</p>}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[#a0a0a0] text-xs">
                <Icons.Clock size={12} /> {s.duration} MIN
              </div>
              <button className="text-[#f5b800] text-xs font-semibold tracking-wider flex items-center gap-1 hover:gap-2 transition-all">
                {lang ? 'SELECT' : 'SELECIONAR'} <Icons.ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-2xl bg-[rgba(245,184,0,0.1)] flex items-center justify-center">
                {getIcon(selected.icon)}
              </div>
              <button onClick={() => setSelected(null)} className="text-[#a0a0a0] hover:text-white">
                <Icons.X size={20} />
              </button>
            </div>
            <h3 className="font-display font-bold text-2xl text-white mb-1">{selected.name.toUpperCase()}</h3>
            <p className="text-[#a0a0a0] text-sm mb-4">{selected.description || (lang ? 'Professional service' : 'Serviço profissional')}</p>
            <div className="flex gap-4 mb-6">
              <div className="flex-1 p-3 rounded-lg bg-[rgba(245,184,0,0.05)] border border-[rgba(245,184,0,0.2)] text-center">
                <p className="text-xs text-[#a0a0a0] mb-1">{lang ? 'PRICE' : 'PREÇO'}</p>
                <p className="font-display font-bold text-xl text-[#f5b800]">R$ {parseFloat(selected.price).toFixed(2)}</p>
              </div>
              <div className="flex-1 p-3 rounded-lg bg-[rgba(245,184,0,0.05)] border border-[rgba(245,184,0,0.2)] text-center">
                <p className="text-xs text-[#a0a0a0] mb-1">{lang ? 'DURATION' : 'DURAÇÃO'}</p>
                <p className="font-display font-bold text-xl text-white">{selected.duration} MIN</p>
              </div>
            </div>
            <button onClick={() => { setSelected(null); navigate(`/booking?service=${selected.id}`); }}
              className="btn-gold w-full py-3 text-sm">
              {lang ? 'BOOK THIS SERVICE' : 'AGENDAR ESTE SERVIÇO'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
