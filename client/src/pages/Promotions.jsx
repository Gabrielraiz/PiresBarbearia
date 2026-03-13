import React, { useEffect, useState } from 'react';
import Icons from '../components/Icons';
import api from '../api';
import { useSettings } from '../contexts/SettingsContext';

export default function Promotions() {
  const { t, settings, labels } = useSettings();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/promotions').then(r => setPromotions(r.data)).finally(() => setLoading(false));
  }, []);

  const getLangValue = (p, field) => {
    const lang = settings.language;
    if (lang === 'en') return p[`${field}_en`] || p[`${field}_pt`];
    if (lang === 'es') return p[`${field}_es`] || p[`${field}_pt`];
    if (lang === 'fr') return p[`${field}_fr`] || p[`${field}_pt`];
    if (lang === 'de') return p[`${field}_de`] || p[`${field}_pt`];
    if (lang === 'it') return p[`${field}_it`] || p[`${field}_pt`];
    return p[`${field}_pt`];
  };

  return (
    <div className="p-4 md:p-12 min-h-screen bg-[var(--bg-main)]">
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-1 bg-[var(--gold)] rounded-full" />
          <span className="text-[var(--gold)] font-black tracking-[0.3em] text-xs uppercase">{t('Ofertas Exclusivas', 'Exclusive Offers', 'Ofertas Exclusivas', 'Offres Exclusives', 'Exklusive Angebote', 'Offerte Esclusive')}</span>
        </div>
        <h1 className="font-display font-black text-6xl md:text-8xl tracking-tighter italic uppercase text-white">
          {t('PROMO', 'PROMO', 'PROMO', 'PROMO', 'PROMO', 'PROMO')} <span className="text-[var(--gold)]">{t('ÇÕES', 'TIONS', 'CIONES', 'TIONS', 'TIONEN', 'ZIONI')}</span>
        </h1>
        <p className="text-sm mt-6 font-bold tracking-[0.2em] uppercase italic text-[var(--text-secondary)]">
          {t('APROVEITE NOSSOS BENEFÍCIOS ESPECIAIS', 'ENJOY OUR SPECIAL BENEFITS', 'APROVECHE NUESTROS BENEFICIOS ESPECIALES')}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-[var(--bg-card)] rounded-[2.5rem] animate-pulse" />)}
        </div>
      ) : promotions.length === 0 ? (
        <div className="card p-20 text-center border-dashed border-[var(--border)] bg-[var(--bg-card)]/30 rounded-[3rem] max-w-2xl mx-auto">
          <Icons.Tag size={48} className="text-[var(--text-secondary)]/20 mx-auto mb-6" />
          <h3 className="text-white font-black text-xl uppercase tracking-widest">{t('NENHUMA PROMOÇÃO ATIVA', 'NO ACTIVE PROMOTIONS', 'NINGUNA PROMOCIÓN ACTIVA')}</h3>
          <p className="text-[var(--text-secondary)] text-sm mt-4 italic">{t('Fique atento às nossas redes sociais para novidades.', 'Stay tuned to our social media for updates.', 'Manténgase atento a nuestras redes sociales para novedades.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promotions.map(p => (
            <div key={p.id} className="group relative card p-10 bg-[var(--bg-card)] border-[var(--border)] rounded-[3rem] overflow-hidden hover:border-[var(--gold)]/30 transition-all duration-500 shadow-2xl">
              <div className="absolute top-0 right-0 p-8">
                <div className="w-16 h-16 rounded-2xl bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)] group-hover:scale-110 group-hover:bg-[var(--gold)] group-hover:text-black transition-all duration-500">
                  <Icons.Zap size={32} />
                </div>
              </div>
              
              <div className="mb-8">
                <p className="text-[var(--gold)] text-[10px] font-black tracking-[0.3em] uppercase mb-4 italic">
                  {p.discount_type === 'percentage' ? `${p.discount_value}% OFF` : `${settings.language === 'pt' ? 'R$' : '$'} ${p.discount_value} OFF`}
                </p>
                <h3 className="font-display font-black text-3xl text-white tracking-tighter uppercase italic leading-none mb-4">{getLangValue(p, 'title')}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed italic font-medium">{getLangValue(p, 'description')}</p>
              </div>

              {p.code && (
                <div className="mb-10 p-6 rounded-2xl bg-[var(--bg-main)] border border-dashed border-[var(--gold)]/30 text-center group/code relative overflow-hidden">
                  <p className="text-[8px] font-black text-[var(--text-secondary)] tracking-widest uppercase mb-2">{t('CÓDIGO PROMOCIONAL', 'PROMO CODE', 'CÓDIGO PROMOCIONAL')}</p>
                  <p className="text-[var(--gold)] font-mono font-black text-2xl tracking-[0.2em]">{p.code}</p>
                  <div className="absolute inset-0 bg-[var(--gold)] opacity-0 group-hover/code:opacity-5 transition-opacity" />
                </div>
              )}

              <button 
                onClick={() => window.location.href = '/booking'}
                className="w-full py-5 bg-[var(--bg-main)] border border-[var(--border)] hover:border-[var(--gold)] text-white font-black text-[10px] tracking-[0.3em] uppercase rounded-2xl transition-all duration-500 flex items-center justify-center gap-3 italic"
              >
                {t('APROVEITAR AGORA', 'USE NOW', 'APROVECHAR AHORA')}
                <Icons.ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
