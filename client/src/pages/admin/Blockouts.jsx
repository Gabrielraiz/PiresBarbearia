import React, { useEffect, useState } from 'react';
import Icons from '../../components/Icons';
import api from '../../api';
import { useSettings } from '../../contexts/SettingsContext';
import { getApiErrorMessage } from '../../lib/apiError';

export default function AdminBlockouts() {
  const { settings, t, labels } = useSettings();
  const [blockouts, setBlockouts] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/blockouts')
      .then(r => setBlockouts(r.data))
      .catch(err => setError(getApiErrorMessage(err, 'Erro ao carregar bloqueios')))
      .finally(() => setLoading(false));
  }, []);

  const handleAddBlockout = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await api.post('/blockouts', { start_date: startDate, end_date: endDate, reason });
      setBlockouts([data, ...blockouts]);
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Erro ao adicionar bloqueio'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('Tem certeza que deseja remover este bloqueio?', 'Are you sure you want to remove this blockout?'))) return;
    try {
      await api.delete(`/blockouts/${id}`);
      setBlockouts(blockouts.filter(b => b.id !== id));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Erro ao remover bloqueio'));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[var(--bg-main)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="text-center md:text-left">
          <h1 className="font-display font-black text-5xl md:text-6xl text-[var(--text-primary)] tracking-tighter mb-4 uppercase">
            BLOQUEIOS DE <span className="text-[var(--gold)]">AGENDA</span>
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="h-1 w-20 bg-[var(--gold)] rounded-full" />
            <p className="text-[var(--text-secondary)] font-medium tracking-[0.3em] text-xs uppercase">
              {t(`GERENCIE DATAS INDISPONÍVEIS PARA ${labels.appointments.toUpperCase()}`, `MANAGE UNAVAILABLE DATES FOR ${labels.appointments.toUpperCase()}`)}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl mb-8 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-3 animate-in fade-in duration-300 shadow-lg">
          <Icons.AlertCircle size={18} />
          {error}
        </div>
      )}
      
      {/* Form Card */}
      <div className="card p-8 md:p-10 bg-[var(--bg-card)] border-[var(--border)] shadow-2xl rounded-[2.5rem] mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)] shadow-inner">
            <Icons.CalendarX size={24} />
          </div>
          <h2 className="font-display font-black text-xl text-[var(--text-primary)] tracking-tight uppercase italic">{t('NOVO BLOQUEIO', 'NEW BLOCKOUT')}</h2>
        </div>

        <form onSubmit={handleAddBlockout} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase ml-1">{t('DATA INICIAL', 'START DATE')}</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-4 text-[var(--text-primary)] focus:border-[var(--gold)] transition-all outline-none font-bold" 
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase ml-1">{t('DATA FINAL', 'END DATE')}</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
              className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-4 text-[var(--text-primary)] focus:border-[var(--gold)] transition-all outline-none font-bold" 
              required 
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[var(--text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase ml-1">{t('MOTIVO DO BLOQUEIO', 'BLOCKOUT REASON')}</label>
            <div className="relative">
              <input 
                type="text" 
                value={reason} 
                onChange={e => setReason(e.target.value)} 
                className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-4 text-[var(--text-primary)] focus:border-[var(--gold)] transition-all outline-none font-bold" 
                placeholder={t('Ex: Feriado de Natal', 'Ex: Christmas holiday')} 
              />
              <Icons.FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]/30" />
            </div>
          </div>
          <div className="md:col-span-4 flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="group flex items-center justify-center gap-3 px-10 py-4 bg-[var(--gold)] text-black font-black text-xs tracking-[0.2em] uppercase rounded-2xl hover:bg-white transition-all shadow-xl shadow-[var(--gold)]/20 active:scale-95 disabled:opacity-50"
            >
              {saving ? <Icons.RefreshCw size={18} className="animate-spin" /> : <Icons.Plus size={18} className="group-hover:scale-125 transition-transform" />}
              {saving ? t('ADICIONANDO...', 'ADDING...') : t('ADICIONAR BLOQUEIO', 'ADD BLOCKOUT')}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-8 w-1 bg-[var(--gold)] rounded-full" />
          <h2 className="font-display font-black text-2xl text-[var(--text-primary)] tracking-tight uppercase italic">{t('BLOQUEIOS ATIVOS', 'ACTIVE BLOCKOUTS')}</h2>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl animate-pulse" />)}
          </div>
        ) : blockouts.length === 0 ? (
          <div className="card p-20 text-center border-dashed border-[var(--border)] bg-[var(--bg-card)]/30 rounded-[3rem]">
            <div className="w-24 h-24 bg-[var(--bg-main)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border)] shadow-inner">
              <Icons.CalendarX size={48} className="text-[var(--text-secondary)]/20" />
            </div>
            <h4 className="text-[var(--text-primary)] font-black text-xl uppercase tracking-widest">{t('NENHUM BLOQUEIO ATIVO', 'NO ACTIVE BLOCKOUTS')}</h4>
            <p className="text-[var(--text-secondary)] text-sm max-w-xs mx-auto mt-4 italic font-medium">{t('Toda a agenda está disponível para agendamentos.', 'The entire schedule is available for bookings.')}</p>
          </div>
        ) : (
          <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {blockouts.map(b => (
              <div key={b.id} className="group card p-6 bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--gold)]/50 transition-all duration-500 shadow-lg rounded-[2rem] flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 shadow-inner group-hover:scale-110 transition-transform">
                  <Icons.CalendarX size={28} />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                    <span className="text-[var(--gold)] font-display font-black text-xl tracking-tighter">{formatDate(b.start_date)}</span>
                    <Icons.ArrowRight size={14} className="text-[var(--text-secondary)]/30" />
                    <span className="text-[var(--gold)] font-display font-black text-xl tracking-tighter">{formatDate(b.end_date)}</span>
                  </div>
                  <p className="text-[var(--text-primary)] font-bold text-sm tracking-wide uppercase italic">
                    {b.reason || t('SEM MOTIVO ESPECIFICADO', 'NO REASON SPECIFIED')}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleDelete(b.id)} 
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95"
                    title={t('Remover Bloqueio', 'Remove Blockout')}
                  >
                    <Icons.Trash size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
