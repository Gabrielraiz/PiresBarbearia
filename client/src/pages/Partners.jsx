import React, { useEffect, useState } from 'react';
import Icons from '../components/Icons';
import api from '../api';
import { useSettings } from '../contexts/SettingsContext';

export default function Partners() {
  const { t, settings } = useSettings();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/partners').then(r => {
      setPartners(r.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-16 md:mb-24">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-12 h-1 bg-[var(--gold)] rounded-full" />
          <span className="text-[var(--gold)] font-black tracking-[0.4em] text-xs uppercase">{t('Nossos Parceiros', 'Our Partners')}</span>
          <div className="w-12 h-1 bg-[var(--gold)] rounded-full" />
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-none mb-8">
          VANTAGENS <span className="text-[var(--gold)]">CLUB</span>
        </h1>
        <p className="text-[var(--text-secondary)] text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed italic">
          {t('Conheça as empresas e profissionais que fazem parte da nossa rede e aproveite benefícios exclusivos para membros da PiresQK.', 'Meet the companies and professionals in our network and enjoy exclusive benefits for PiresQK members.')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {partners.map(p => (
          <div key={p.id} className="group relative card p-8 bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden hover:border-[var(--gold)]/30 transition-all duration-500 shadow-2xl">
            <div className="absolute top-0 right-0 p-6">
              <div className="w-12 h-12 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)] group-hover:bg-[var(--gold)] group-hover:text-black transition-all">
                <Icons.Handshake size={20} />
              </div>
            </div>
            
            <div className="mb-8">
              <div className="w-20 h-20 rounded-3xl bg-[var(--bg-main)] border border-[var(--border)] flex items-center justify-center text-[var(--gold)] mb-6 shadow-xl">
                {p.photo ? (
                  <img src={p.photo} alt={p.name} className="w-full h-full object-cover rounded-3xl" />
                ) : (
                  <Icons.User size={40} className="opacity-20" />
                )}
              </div>
              <p className="text-[var(--gold)] text-[10px] font-black tracking-[0.3em] uppercase mb-2 italic">
                {p.discount_type === 'percentage' ? `${p.discount_value}% OFF` : `R$ ${p.discount_value} OFF`}
              </p>
              <h3 className="font-display font-black text-3xl text-white tracking-tighter uppercase italic leading-none mb-4">{p.name}</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed italic font-medium line-clamp-3">
                {settings.language === 'en' ? (p.description_en || p.description_pt) : p.description_pt}
              </p>
            </div>

            <div className="flex items-center gap-4 pt-6 border-t border-[var(--border)]">
              <div className="flex-1">
                <p className="text-[10px] font-black text-[var(--text-secondary)] tracking-widest uppercase mb-1">{t('COMO USAR', 'HOW TO USE')}</p>
                <p className="text-xs font-black text-white uppercase italic">{t('Apresente seu perfil', 'Show your profile')}</p>
              </div>
              <Icons.ArrowRight size={20} className="text-[var(--gold)] group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {partners.length === 0 && (
        <div className="text-center py-20 bg-[var(--bg-card)]/30 border border-dashed border-[var(--border)] rounded-[3rem]">
          <Icons.Handshake size={60} className="mx-auto text-[var(--text-secondary)]/20 mb-6" />
          <h2 className="text-2xl font-black text-white uppercase italic mb-2">{t('EM BREVE NOVAS PARCERIAS', 'NEW PARTNERSHIPS SOON')}</h2>
          <p className="text-[var(--text-secondary)] text-sm italic">{t('Estamos selecionando os melhores parceiros para você.', 'We are selecting the best partners for you.')}</p>
        </div>
      )}
    </div>
  );
}
