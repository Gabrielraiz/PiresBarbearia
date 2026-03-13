import React, { useEffect, useState } from 'react';
import Icons from '../../components/Icons';
import api from '../../api';
import { useSettings } from '../../contexts/SettingsContext';

export default function AdminPromotions() {
  const { t } = useSettings();
  const [promotions, setPromotions] = useState([]);
  const [services, setServices] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ 
    title_pt: '', title_en: '', description_pt: '', description_en: '', 
    discount_type: 'percentage', discount_value: 0, code: '', active: 1,
    is_secret: 0, service_id: null, min_value: 0
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { 
    loadPromotions(); 
    api.get('/services').then(r => setServices(r.data));
  }, []);

  const loadPromotions = () => {
    api.get('/promotions/all').then(r => {
      setPromotions(Array.isArray(r.data) ? r.data : []);
    }).catch(err => {
      console.error('Error loading promotions:', err);
      setPromotions([]);
    });
  };

  const openAdd = () => { 
    setForm({ 
      title_pt: '', title_en: '', description_pt: '', description_en: '', 
      discount_type: 'percentage', discount_value: 0, code: '', active: 1,
      is_secret: 0, service_id: null, min_value: 0
    }); 
    setModal('add'); 
  };
  
  const openEdit = (p) => { setForm({ ...p, is_secret: p.is_secret || 0, min_value: p.min_value || 0, service_id: p.service_id || null }); setModal(p.id); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/promotions', form);
      } else {
        await api.put(`/promotions/${modal}`, form);
      }
      setModal(null);
      loadPromotions();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Excluir esta promoção?')) return;
    await api.delete(`/promotions/${id}`);
    loadPromotions();
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[var(--bg-main)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="text-center md:text-left">
          <h1 className="font-display font-black text-5xl md:text-6xl text-[var(--text-primary)] tracking-tighter mb-4">
            GESTÃO DE <span className="text-[var(--gold)]">PROMOÇÕES</span>
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="h-1 w-20 bg-[var(--gold)] rounded-full" />
            <p className="text-[var(--text-secondary)] font-medium tracking-[0.3em] text-xs uppercase">
              CRIE OFERTAS E DESCONTOS EXCLUSIVOS
            </p>
          </div>
        </div>
        
        <button 
          onClick={openAdd} 
          className="group flex items-center justify-center gap-3 px-8 py-4 bg-[var(--gold)] text-black font-black text-xs tracking-[0.2em] uppercase rounded-2xl hover:bg-white transition-all shadow-xl shadow-[var(--gold)]/20 active:scale-95"
        >
          <Icons.Plus size={18} /> NOVA PROMOÇÃO
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map(p => (
          <div key={p.id} className={`card p-6 bg-[var(--bg-card)] border-[var(--border)] relative overflow-hidden group hover:border-[var(--gold)]/30 transition-all ${!p.active ? 'opacity-50' : ''}`}>
            <div className="absolute top-0 right-0 p-4 flex flex-col items-end gap-2">
               <span className={`px-3 py-1 text-[8px] font-black tracking-widest uppercase rounded-full border ${p.active ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                 {p.active ? 'Ativa' : 'Inativa'}
               </span>
               {p.is_secret === 1 && (
                 <span className="px-3 py-1 text-[8px] font-black tracking-widest uppercase rounded-full border bg-amber-500/10 text-amber-500 border-amber-500/20 flex items-center gap-1">
                   <Icons.EyeOff size={10} /> Secreta
                 </span>
               )}
            </div>
            <h3 className="font-display font-black text-xl text-white uppercase italic mb-2">{p.title_pt}</h3>
            <p className="text-[var(--text-secondary)] text-xs mb-4 line-clamp-2">{p.description_pt}</p>
            <div className="flex items-center gap-4 mb-6">
               <div className="px-4 py-2 bg-[var(--gold)]/10 border border-[var(--gold)]/20 rounded-xl">
                 <p className="text-[var(--gold)] font-black text-lg">{p.discount_type === 'percentage' ? `${p.discount_value}%` : `R$ ${p.discount_value}`}</p>
               </div>
               {p.code && (
                 <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                   <p className="text-white font-mono font-bold text-sm tracking-widest">{p.code}</p>
                 </div>
               )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(p)} className="flex-1 py-3 bg-[var(--bg-main)] border border-[var(--border)] text-white text-[10px] font-black tracking-widest uppercase rounded-xl hover:border-[var(--gold)] transition-all">EDITAR</button>
              <button onClick={() => handleDelete(p.id)} className="w-12 h-12 flex items-center justify-center border border-[var(--border)] text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Icons.Trash size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setModal(null)}>
          <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-[var(--border)]">
              <h3 className="font-display font-black text-2xl text-white uppercase italic tracking-tighter leading-none">
                {modal === 'add' ? 'NOVA PROMOÇÃO' : 'EDITAR PROMOÇÃO'}
              </h3>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest ml-1">TÍTULO (PT)</label>
                <input value={form.title_pt} onChange={e => setForm({ ...form, title_pt: e.target.value })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--gold)]" />
              </div>
              <div className="space-y-1">
                <label className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest ml-1">DESCRIÇÃO (PT)</label>
                <textarea value={form.description_pt} onChange={e => setForm({ ...form, description_pt: e.target.value })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--gold)] h-24 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest ml-1">TIPO DESCONTO</label>
                  <select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3 text-white outline-none">
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest ml-1">VALOR</label>
                  <input type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: parseFloat(e.target.value) })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--gold)]" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest ml-1">CÓDIGO (OPCIONAL)</label>
                <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--gold)] font-mono font-bold tracking-widest uppercase outline-none focus:border-[var(--gold)]" />
              </div>
              <div className="space-y-1">
                <label className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest ml-1">APLICAR EM SERVIÇO (OPCIONAL)</label>
                <select 
                  value={form.service_id || ''} 
                  onChange={e => setForm({ ...form, service_id: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--gold)]"
                >
                  <option value="">Todos os Serviços</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest ml-1">VALOR MÍNIMO DO SERVIÇO (R$)</label>
                <input 
                  type="number" 
                  value={form.min_value} 
                  onChange={e => setForm({ ...form, min_value: parseFloat(e.target.value) })}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--gold)]" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl cursor-pointer" onClick={() => setForm({ ...form, active: form.active ? 0 : 1 })}>
                   <div className={`w-10 h-5 rounded-full transition-colors relative ${form.active ? 'bg-green-500' : 'bg-red-500/30'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${form.active ? 'translate-x-6' : 'translate-x-1'}`} />
                   </div>
                   <span className="text-[8px] font-black uppercase tracking-widest text-white">PROMOÇÃO ATIVA</span>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl cursor-pointer" onClick={() => setForm({ ...form, is_secret: form.is_secret ? 0 : 1 })}>
                   <div className={`w-10 h-5 rounded-full transition-colors relative ${form.is_secret ? 'bg-amber-500' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${form.is_secret ? 'translate-x-6' : 'translate-x-1'}`} />
                   </div>
                   <span className="text-[8px] font-black uppercase tracking-widest text-white">PROMOÇÃO SECRETA</span>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setModal(null)} className="flex-1 py-4 text-[10px] font-black tracking-widest uppercase text-[var(--text-secondary)]">CANCELAR</button>
                <button onClick={handleSave} className="flex-[2] py-4 bg-[var(--gold)] text-black font-black text-[10px] tracking-widest uppercase rounded-2xl">SALVAR PROMOÇÃO</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
