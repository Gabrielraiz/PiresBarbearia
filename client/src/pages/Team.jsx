import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import Icons from '../components/Icons';
import api from '../api';
import PageSkeleton from '../components/PageSkeleton';
import { fetchWithCache } from '../lib/requestCache';
import { getApiErrorMessage } from '../lib/apiError';

export default function Team() {
  const { settings, t, labels } = useSettings();
  const navigate = useNavigate();
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedBarber, setSelectedBarber] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchWithCache('barbers:list', async () => {
      const response = await api.get('/barbers');
      return response.data;
    }, 60000).then((barbersData) => {
      if (!mounted) return;
      setBarbers(barbersData);
    }).catch((err) => {
      if (!mounted) return;
      setErrorMessage(getApiErrorMessage(err, t('Não foi possível carregar os profissionais.', 'Could not load professionals.')));
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleBook = (e, id) => {
    e.stopPropagation();
    navigate(`/booking?barber=${id}`);
  };

  const getBarberPhotos = (barber) => {
    try {
      return barber.photos_json ? JSON.parse(barber.photos_json) : [];
    } catch {
      return [];
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[var(--bg-main)]">
      <div className="mb-12 text-center md:text-left">
        <h1 className="font-display font-black text-5xl md:text-6xl text-[var(--text-primary)] tracking-tighter mb-4">
          {`${labels.professionals.toUpperCase()} `}<span className="text-[var(--gold)]">ELITE</span>
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="h-1 w-20 bg-[var(--gold)] rounded-full" />
          <p className="text-[var(--text-secondary)] font-medium tracking-[0.3em] text-xs uppercase">
            {t(`ESPECIALISTAS DE ${labels.industry.toUpperCase()} AO SEU SERVIÇO`, `EXPERT ${labels.professionals.toUpperCase()} AT YOUR SERVICE`)}
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-3">
          <Icons.AlertCircle size={16} />
          {errorMessage}
        </div>
      )}

      {loading ? (
        <PageSkeleton cards={8} minHeight="min-h-[260px]" />
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {barbers.map(b => (
          <div 
            key={b.id} 
            onClick={() => setSelectedBarber(b)}
            className="group relative card overflow-hidden border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--gold)]/50 transition-all duration-500 shadow-2xl hover:shadow-[var(--gold)]/10 cursor-pointer"
          >
            {/* Overlay Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--gold)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="p-8 flex flex-col items-center text-center">
              <div className="relative mb-8">
                <div className="w-32 h-32 rounded-[2.5rem] bg-[var(--bg-main)] border-2 border-[var(--border)] group-hover:border-[var(--gold)] overflow-hidden transition-all duration-500 shadow-2xl relative z-10">
                  {b.photo ? (
                    <img src={b.photo} alt={b.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--gold)] font-display font-black text-5xl italic">
                      {b.name.charAt(0)}
                    </div>
                  )}
                </div>
                
                {/* Status Indicator */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center z-20 group-hover:border-[var(--gold)]/50 transition-colors shadow-xl">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                </div>

                {/* Decorative Elements */}
                <div className="absolute inset-0 bg-[var(--gold)] opacity-0 group-hover:opacity-10 blur-[40px] rounded-full transition-opacity duration-700" />
              </div>

              <div className="mb-8 flex-1">
                <h3 className="font-display font-black text-[var(--text-primary)] text-2xl mb-2 group-hover:text-[var(--gold)] transition-colors uppercase italic tracking-tighter leading-none">
                  {b.name}
                </h3>
                <p className="text-[var(--gold)] text-[10px] font-black uppercase tracking-[0.2em] mb-4 italic">
                  {b.specialty || t('PROFISSIONAL MASTER', 'MASTER PROFESSIONAL')}
                </p>
                {b.avg_rating > 0 && (
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Icons.Star 
                          key={s} 
                          size={14} 
                          className={b.avg_rating >= s ? 'text-[var(--gold)]' : 'text-[var(--border)]'} 
                          fill={b.avg_rating >= s ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-[var(--text-secondary)] font-medium">({b.review_count})</span>
                  </div>
                )}
                <div className="h-[1px] w-8 bg-[var(--border)] mx-auto mb-4 group-hover:w-16 transition-all duration-500" />
                {b.bio && (
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-2 italic font-medium">
                    "{b.bio}"
                  </p>
                )}
              </div>

              <button 
                onClick={(e) => handleBook(e, b.id)}
                className="w-full group/btn relative py-4 bg-[var(--bg-main)] border border-[var(--border)] hover:border-[var(--gold)] text-[var(--text-primary)] font-black text-[10px] tracking-[0.3em] uppercase rounded-2xl transition-all duration-500 overflow-hidden shadow-lg active:scale-95"
              >
                <span className="relative z-10 group-hover/btn:text-black transition-colors duration-300">
                  {t(`AGENDAR COM ${b.name.split(' ')[0]}`.toUpperCase(), `BOOK WITH ${b.name.split(' ')[0]}`.toUpperCase())}
                </span>
                <div className="absolute inset-0 bg-[var(--gold)] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]" />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Modal Detalhes do Barbeiro */}
      {selectedBarber && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500" onClick={() => setSelectedBarber(null)}>
          <div className="w-full max-w-4xl bg-[var(--bg-card)] border border-[var(--border)] rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 flex flex-col md:flex-row h-full max-h-[85vh]" onClick={e => e.stopPropagation()}>
            {/* Imagem de Destaque */}
            <div className="md:w-2/5 relative h-64 md:h-auto border-b md:border-b-0 md:border-r border-[var(--border)]">
              <img src={selectedBarber.photo || 'https://via.placeholder.com/600x800'} alt={selectedBarber.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-8 left-8 right-8">
                <h2 className="font-display font-black text-4xl text-white tracking-tighter uppercase italic leading-none mb-2">{selectedBarber.name}</h2>
                <p className="text-[var(--gold)] text-xs font-black uppercase tracking-widest italic">{selectedBarber.specialty}</p>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="md:w-3/5 p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <p className="text-[var(--text-secondary)] text-[10px] font-black tracking-[0.4em] uppercase italic mb-4">SOBRE O PROFISSIONAL</p>
                  <div className="h-1 w-12 bg-[var(--gold)] rounded-full" />
                </div>
                <button onClick={() => setSelectedBarber(null)} className="w-12 h-12 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-all">
                  <Icons.X size={24} />
                </button>
              </div>

              <p className="text-[var(--text-primary)] text-lg leading-relaxed italic font-medium mb-10">
                "{selectedBarber.bio || t('Profissional altamente qualificado focado na excelência e no atendimento premium.', 'Highly qualified professional focused on excellence and premium service.')}"
              </p>

              {/* Galeria do Barbeiro */}
              <div className="mb-10">
                <p className="text-[var(--text-secondary)] text-[10px] font-black tracking-[0.4em] uppercase italic mb-6">PORTFÓLIO & TRABALHOS</p>
                <div className="grid grid-cols-3 gap-4">
                  {getBarberPhotos(selectedBarber).length > 0 ? getBarberPhotos(selectedBarber).map((photo, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[var(--gold)]/50 transition-all cursor-zoom-in">
                      <img src={photo} alt="Trabalho" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                    </div>
                  )) : (
                    [1,2,3].map(i => (
                      <div key={i} className="aspect-square rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)]/20">
                        <Icons.Image size={24} />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Estatísticas Rápidas */}
              <div className="grid grid-cols-2 gap-4 mb-12">
                <div className="p-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] text-center">
                  <p className="text-[var(--gold)] font-display font-black text-3xl leading-none mb-2">{selectedBarber.review_count || '0'}</p>
                  <p className="text-[var(--text-secondary)] text-[8px] font-black uppercase tracking-widest">{t('AVALIAÇÕES', 'REVIEWS')}</p>
                </div>
                <div className="p-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] text-center">
                  <p className="text-[var(--gold)] font-display font-black text-3xl leading-none mb-2">{selectedBarber.avg_rating || '5.0'}</p>
                  <p className="text-[var(--text-secondary)] text-[8px] font-black uppercase tracking-widest">{t('NOTA MÉDIA', 'AVG RATING')}</p>
                </div>
              </div>

              <button 
                onClick={(e) => handleBook(e, selectedBarber.id)}
                className="w-full py-6 bg-[var(--gold)] text-black font-black text-xs tracking-[0.4em] uppercase rounded-[2rem] shadow-2xl shadow-[var(--gold)]/20 hover:bg-white transition-all active:scale-95 flex items-center justify-center gap-4 italic mt-auto"
              >
                {t(`AGENDAR COM ${selectedBarber.name.split(' ')[0]}`, `BOOK WITH ${selectedBarber.name.split(' ')[0]}`)}
                <Icons.ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {barbers.length === 0 && (
        <div className="card p-20 text-center border-dashed border-[var(--border)] bg-[var(--bg-card)]/30 max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-[var(--bg-main)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border)]">
            <Icons.Users size={40} className="text-[var(--text-secondary)]/20" />
          </div>
          <h4 className="text-[var(--text-primary)] font-bold text-lg uppercase tracking-widest mb-2">
            {t(`${labels.professionals.toUpperCase()} EM BREVE`, `${labels.professionals.toUpperCase()} COMING SOON`)}
          </h4>
          <p className="text-[var(--text-secondary)] text-sm italic">
            {t('Nossa equipe está preparando tudo para você.', 'Our team is preparing everything for you.')}
          </p>
        </div>
      )}
    </div>
  );
}
