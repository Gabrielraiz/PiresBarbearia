import React, { useEffect, useState } from 'react';
import Icons from '../../components/Icons';
import api from '../../api';

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', duration: 30, icon: 'scissors', active: 1 });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadServices(); }, []);

  const loadServices = () => api.get('/services/all').then(r => setServices(r.data));

  const openAdd = () => {
    setForm({ name: '', description: '', price: '', duration: 30, icon: 'scissors', active: 1 });
    setModal('add');
  };

  const openEdit = (s) => {
    setForm({ name: s.name, description: s.description || '', price: s.price, duration: s.duration, icon: s.icon || 'scissors', active: s.active });
    setModal(s.id);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/services', form);
      } else {
        await api.put(`/services/${modal}`, form);
      }
      setModal(null);
      loadServices();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, force = false) => {
    const msg = force 
      ? 'EXCLUIR PERMANENTEMENTE este serviço? Esta ação não pode ser desfeita.' 
      : 'Desativar este serviço? Ele não aparecerá mais para agendamentos.';
    
    if (!confirm(msg)) return;
    
    try {
      await api.delete(`/services/${id}${force ? '?force=true' : ''}`);
      loadServices();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao excluir');
    }
  };

  const iconOptions = ['scissors', 'package', 'eye', 'users'];

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[var(--bg-main)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="text-center md:text-left">
          <h1 className="font-display font-black text-5xl md:text-6xl text-[var(--text-primary)] tracking-tighter mb-4">
            MENU DE <span className="text-[var(--gold)]">SERVIÇOS</span>
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="h-1 w-20 bg-[var(--gold)] rounded-full" />
            <p className="text-[var(--text-secondary)] font-medium tracking-[0.3em] text-xs uppercase">
              GESTÃO DO CARDÁPIO DE CORTES E TRATAMENTOS
            </p>
          </div>
        </div>
        
        <button 
          onClick={openAdd} 
          className="group flex items-center justify-center gap-3 px-8 py-4 bg-[var(--gold)] text-black font-black text-xs tracking-[0.2em] uppercase rounded-2xl hover:bg-white transition-all shadow-xl shadow-[var(--gold)]/20 active:scale-95"
        >
          <Icons.Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /> 
          NOVO SERVIÇO
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {services.map(s => (
          <div 
            key={s.id} 
            className={`group relative card overflow-hidden border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--gold)]/50 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-[var(--gold)]/10 ${!s.active ? 'opacity-60 grayscale-[0.5]' : ''}`}
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--gold)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="p-8">
              <div className="flex items-start justify-between mb-8">
                <div className="w-16 h-16 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] flex items-center justify-center shadow-inner group-hover:border-[var(--gold)]/40 group-hover:scale-105 transition-all duration-500">
                  <Icons.Scissors size={32} className="text-[var(--gold)]" />
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className={`px-3 py-1 text-[8px] font-black tracking-[0.2em] uppercase rounded-full border ${
                    s.active 
                      ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {s.active ? 'DISPONÍVEL' : 'INATIVO'}
                  </span>
                  <div className="text-right">
                    <p className="text-[var(--text-secondary)] text-[10px] font-bold tracking-widest uppercase mb-1">INVESTIMENTO</p>
                    <p className="text-[var(--gold)] font-display font-black text-3xl tracking-tighter leading-none">
                      <span className="text-sm mr-1 opacity-50">R$</span>{parseFloat(s.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-display font-black text-[var(--text-primary)] text-2xl mb-3 group-hover:text-[var(--gold)] transition-colors uppercase italic tracking-tighter leading-none">
                  {s.name}
                </h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-2 min-h-[40px] font-medium italic">
                  "{s.description || 'Experiência profissional de alto padrão para o seu visual.'}"
                </p>
              </div>

              <div className="flex items-center gap-6 py-4 border-y border-[var(--border)] mb-8">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.2em]">
                  <Icons.Clock size={16} className="text-[var(--gold)]" />
                  <span>{s.duration} MINUTOS</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-[var(--border)]" />
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.2em]">
                  <Icons.Zap size={16} className="text-[var(--gold)]" />
                  <span>PREMIUM</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => openEdit(s)} 
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-primary)] font-black text-[10px] tracking-[0.2em] uppercase rounded-xl hover:border-[var(--gold)] transition-all active:scale-95"
                >
                  <Icons.Edit size={14} className="text-[var(--gold)]" /> EDITAR
                </button>
                
                <div className="flex gap-2">
                  {s.active ? (
                    <button 
                      onClick={() => handleDelete(s.id)} 
                      title="Desativar Temporariamente" 
                      className="w-12 h-12 flex items-center justify-center border border-[var(--border)] bg-[var(--bg-main)] rounded-xl text-[var(--text-secondary)] hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/30 transition-all active:scale-90"
                    >
                      <Icons.EyeOff size={18} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleSave(s.id, { active: 1 })} 
                      className="w-12 h-12 flex items-center justify-center border border-[var(--border)] bg-[var(--bg-main)] rounded-xl text-green-400 hover:bg-green-500/10 hover:border-green-500/30 transition-all active:scale-90"
                    >
                      <Icons.Check size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(s.id, true)} 
                    title="Excluir Permanentemente" 
                    className="w-12 h-12 flex items-center justify-center border border-[var(--border)] bg-[var(--bg-main)] rounded-xl text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-all active:scale-90"
                  >
                    <Icons.Trash size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal - Modernizado */}
      {(modal === 'add' || typeof modal === 'number') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setModal(null)}>
          <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <p className="text-[var(--gold)] text-[10px] font-black tracking-[0.3em] uppercase mb-1">
                  {modal === 'add' ? 'CRIAÇÃO' : 'EDIÇÃO'}
                </p>
                <h3 className="font-display font-black text-3xl text-[var(--text-primary)] tracking-tighter uppercase">
                  SERVIÇO <span className="text-[var(--gold)]">PROFISSIONAL</span>
                </h3>
              </div>
              <button onClick={() => setModal(null)} className="text-[var(--text-secondary)] hover:text-white transition-colors">
                <Icons.X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-bold tracking-[0.2em] uppercase">
                  <Icons.Type size={14} /> NOME DO SERVIÇO
                </label>
                <input 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--text-primary)] focus:border-[var(--gold)] transition-all outline-none" 
                  placeholder="Ex: Corte Degradê Premium" 
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-bold tracking-[0.2em] uppercase">
                  <Icons.FileText size={14} /> DESCRIÇÃO DETALHADA
                </label>
                <textarea 
                  value={form.description} 
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--text-primary)] focus:border-[var(--gold)] transition-all outline-none h-24 resize-none text-sm" 
                  placeholder="Descreva o serviço para o cliente..." 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-bold tracking-[0.2em] uppercase">
                    <Icons.DollarSign size={14} /> VALOR (R$)
                  </label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--text-primary)] focus:border-[var(--gold)] transition-all outline-none font-bold" 
                    placeholder="0.00" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-bold tracking-[0.2em] uppercase">
                    <Icons.Clock size={14} /> DURAÇÃO
                  </label>
                  <select 
                    value={form.duration} 
                    onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })} 
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--text-primary)] focus:border-[var(--gold)] transition-all outline-none appearance-none cursor-pointer shadow-inner font-bold"
                  >
                    {[15,30,45,60,90,120].map(m => <option key={m} value={m}>{m} MINUTOS</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-bold tracking-[0.2em] uppercase">
                  <Icons.Power size={14} /> VISIBILIDADE NO SITE
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: 1, label: 'ATIVO', color: 'bg-green-500' },
                    { val: 0, label: 'INATIVO', color: 'bg-red-500' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => setForm({ ...form, active: opt.val })}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all font-black text-[10px] tracking-widest ${
                        form.active === opt.val 
                          ? `border-${opt.color}/50 bg-${opt.color}/10 text-${opt.color}` 
                          : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]/30'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${form.active === opt.val ? opt.color : 'bg-[var(--text-secondary)]'}`} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setModal(null)} 
                  className="flex-1 py-4 text-[10px] font-black tracking-[0.2em] uppercase text-[var(--text-secondary)] hover:text-white transition-colors"
                >
                  DESCARTAR
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={saving} 
                  className="flex-[2] py-4 bg-[var(--gold)] text-black font-black text-xs tracking-[0.2em] uppercase rounded-2xl hover:bg-white transition-all shadow-xl shadow-[var(--gold)]/20 active:scale-95 disabled:opacity-50"
                >
                  {saving ? 'PROCESSANDO...' : 'CONFIRMAR SERVIÇO'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
