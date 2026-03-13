import React, { useEffect, useState } from 'react';
import Icons from '../components/Icons';
import api from '../api';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';

export default function Loyalty() {
  const { t, settings } = useSettings();
  const { user } = useAuth();
  const [status, setStatus] = useState({ points: 0, history: [] });
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/loyalty/my-status'),
      api.get('/loyalty/rewards')
    ]).then(([statusRes, rewardsRes]) => {
      setStatus(statusRes.data);
      setRewards(rewardsRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleRedeem = async (reward) => {
    if (status.points < reward.points_required) return alert('Pontos insuficientes');
    if (!confirm(`Deseja resgatar ${reward.title_pt} por ${reward.points_required} pontos?`)) return;
    
    setRedeeming(reward.id);
    try {
      const { data } = await api.post('/loyalty/redeem', { reward_id: reward.id });
      alert(data.message);
      // Refresh status
      const res = await api.get('/loyalty/my-status');
      setStatus(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao resgatar recompensa');
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Left Side: Points & History */}
        <div className="w-full lg:w-1/3 space-y-8">
          <div className="card p-10 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-main)] border border-[var(--border)] rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8">
              <div className="w-16 h-16 rounded-2xl bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)] group-hover:rotate-12 transition-transform duration-500">
                <Icons.Trophy size={32} />
              </div>
            </div>
            <p className="text-[var(--gold)] text-[10px] font-black tracking-[0.4em] uppercase mb-4 italic">{t('MEU SALDO', 'MY BALANCE')}</p>
            <div className="flex items-baseline gap-2 mb-6">
              <h2 className="text-7xl font-black text-white tracking-tighter italic">{status.points}</h2>
              <span className="text-[var(--gold)] font-black tracking-widest text-xs uppercase italic">{t('PONTOS', 'POINTS')}</span>
            </div>
            <p className="text-[var(--text-secondary)] text-sm font-medium italic leading-relaxed">
              {t('A cada R$ 10 em serviços, você ganha 1 ponto. Acumule e troque por recompensas exclusivas!', 'For every R$ 10 in services, you earn 1 point. Accumulate and exchange for exclusive rewards!')}
            </p>
          </div>

          <div className="card p-8 bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] shadow-xl overflow-hidden">
            <h3 className="text-lg font-black text-white tracking-widest uppercase italic mb-6 flex items-center gap-3">
              <Icons.History size={18} className="text-[var(--gold)]" />
              {t('HISTÓRICO', 'HISTORY')}
            </h3>
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
              {status.history.map(h => (
                <div key={h.id} className="flex items-start gap-4 group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${h.type === 'earned' ? 'bg-green-500/10 text-green-500 group-hover:bg-green-500 group-hover:text-black' : 'bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-black'}`}>
                    {h.type === 'earned' ? <Icons.Plus size={14} /> : <Icons.Minus size={14} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-white uppercase italic tracking-tighter line-clamp-1">{settings.language === 'en' ? (h.description_en || h.description_pt) : h.description_pt}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-bold">{new Date(h.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-black italic ${h.type === 'earned' ? 'text-green-500' : 'text-red-500'}`}>
                    {h.type === 'earned' ? '+' : '-'}{h.points}
                  </span>
                </div>
              ))}
              {status.history.length === 0 && (
                <p className="text-center py-10 text-[var(--text-secondary)] text-xs italic">{t('Nenhuma movimentação ainda.', 'No history yet.')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Rewards Catalog */}
        <div className="flex-1 space-y-12">
          <div>
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-1 bg-[var(--gold)] rounded-full" />
              <span className="text-[var(--gold)] font-black tracking-[0.4em] text-[10px] uppercase">{t('RESGATE RECOMPENSAS', 'REDEEM REWARDS')}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none mb-4">
              CATÁLOGO DE <span className="text-[var(--gold)]">RECOMPENSAS</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rewards.map(r => (
              <div key={r.id} className={`group relative card p-8 bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden transition-all duration-500 shadow-2xl ${status.points >= r.points_required ? 'hover:border-[var(--gold)]/50' : 'opacity-60 grayscale'}`}>
                <div className="absolute top-0 right-0 p-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${status.points >= r.points_required ? 'bg-[var(--gold)] text-black shadow-[0_0_20px_rgba(245,184,0,0.3)]' : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border border-[var(--border)]'}`}>
                    <Icons.Trophy size={20} />
                  </div>
                </div>

                <div className="mb-6">
                  <p className={`text-[10px] font-black tracking-[0.3em] uppercase mb-2 italic ${status.points >= r.points_required ? 'text-[var(--gold)]' : 'text-[var(--text-secondary)]'}`}>
                    {r.points_required} PONTOS
                  </p>
                  <h3 className="font-display font-black text-2xl text-white tracking-tighter uppercase italic leading-none mb-3">{settings.language === 'en' ? (r.title_en || r.title_pt) : r.title_pt}</h3>
                  <p className="text-[var(--text-secondary)] text-xs leading-relaxed italic font-medium line-clamp-2">
                    {settings.language === 'en' ? (r.description_en || r.description_pt) : r.description_pt}
                  </p>
                </div>

                <button 
                  onClick={() => handleRedeem(r)}
                  disabled={status.points < r.points_required || redeeming === r.id}
                  className={`w-full py-4 rounded-xl text-[10px] font-black tracking-[0.3em] uppercase transition-all duration-500 flex items-center justify-center gap-2 italic ${status.points >= r.points_required ? 'bg-[var(--gold)] text-black shadow-xl shadow-[var(--gold)]/10 hover:bg-white active:scale-95' : 'bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-secondary)] cursor-not-allowed'}`}
                >
                  {redeeming === r.id ? '...' : (status.points >= r.points_required ? t('RESGATAR AGORA', 'REDEEM NOW') : t('PONTOS INSUFICIENTES', 'INSUFFICIENT POINTS'))}
                  <Icons.ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>

          {rewards.length === 0 && (
            <div className="text-center py-20 bg-[var(--bg-card)]/30 border border-dashed border-[var(--border)] rounded-[3rem]">
              <Icons.Gift size={60} className="mx-auto text-[var(--text-secondary)]/20 mb-6" />
              <h2 className="text-2xl font-black text-white uppercase italic mb-2">{t('EM BREVE NOVAS RECOMPENSAS', 'NEW REWARDS SOON')}</h2>
              <p className="text-[var(--text-secondary)] text-sm italic">{t('Estamos preparando recompensas incríveis para você.', 'We are preparing amazing rewards for you.')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
