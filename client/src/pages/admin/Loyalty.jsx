import React, { useEffect, useState } from 'react';
import Icons from '../../components/Icons';
import api from '../../api';
import { useSettings } from '../../contexts/SettingsContext';

export default function AdminLoyalty() {
  const { t } = useSettings();
  const [rewards, setRewards] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [pointsModal, setPointsModal] = useState(false);
  const [pointsForm, setPointsForm] = useState({ points: 0, reason: '' });
  
  const [modal, setModal] = useState(null);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ 
    title_pt: '', title_en: '', title_es: '',
    description_pt: '', description_en: '', description_es: '',
    points_required: 0, active: 1, 
    reward_type: 'service', // 'service', 'discount', 'product'
    service_id: null,
    discount_value: 0
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { 
    loadRewards(); 
    loadClients();
    loadServices();
  }, []);

  const loadRewards = () => {
    api.get('/loyalty/rewards/all').then(r => setRewards(r.data));
  };

  const loadClients = () => {
    api.get('/clients').then(r => setClients(r.data));
  };

  const loadServices = () => {
    api.get('/services/all').then(r => setServices(r.data));
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const handleUpdatePoints = async () => {
    if (!selectedClient) return;
    setSaving(true);
    try {
      await api.post(`/clients/${selectedClient.id}/points`, pointsForm);
      alert('Pontos atualizados com sucesso!');
      setPointsModal(false);
      loadClients();
    } catch (err) {
      alert('Erro ao atualizar pontos');
    } finally {
      setSaving(false);
    }
  };

  const openAdd = () => { 
    setForm({ 
      title_pt: '', title_en: '', title_es: '',
      description_pt: '', description_en: '', description_es: '',
      points_required: 0, active: 1,
      reward_type: 'service',
      service_id: null,
      discount_value: 0
    }); 
    setModal('add'); 
  };
  const openEdit = (r) => { 
    setForm({ 
      ...r,
      title_es: r.title_es || '',
      description_es: r.description_es || '',
      reward_type: r.reward_type || 'service',
      service_id: r.service_id || null,
      discount_value: r.discount_value || 0
    }); 
    setModal(r.id); 
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'add') await api.post('/loyalty/rewards', form);
      else await api.put(`/loyalty/rewards/${modal}`, form);
      loadRewards();
      setModal(null);
    } catch (err) {
      alert('Erro ao salvar recompensa');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Excluir esta recompensa?')) return;
    await api.delete(`/loyalty/rewards/${id}`);
    loadRewards();
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none mb-3">GESTÃO DE <span className="text-[var(--gold)]">FIDELIDADE</span></h1>
          <p className="text-[var(--text-secondary)] text-xs font-bold tracking-widest uppercase italic">Gerencie recompensas e saldo de pontos dos clientes</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-3 px-8 py-4 bg-[var(--gold)] text-black font-black text-xs tracking-widest uppercase rounded-2xl hover:bg-white transition-all shadow-xl shadow-[var(--gold)]/20 active:scale-95">
          <Icons.Plus size={18} /> NOVA RECOMPENSA
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Rewards List */}
        <div className="lg:col-span-8 space-y-8">
          <h2 className="text-xl font-black text-white tracking-widest uppercase italic flex items-center gap-3 mb-6">
            <Icons.Trophy size={20} className="text-[var(--gold)]" />
            Catálogo de Recompensas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rewards.map(r => (
              <div key={r.id} className="card p-6 border border-[var(--border)] bg-[var(--bg-card)] rounded-[2rem] group relative overflow-hidden transition-all hover:border-[var(--gold)]/30 shadow-xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)] group-hover:scale-110 transition-transform">
                    <Icons.Gift size={24} />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(r)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors"><Icons.Edit size={18} /></button>
                    <button onClick={() => handleDelete(r.id)} className="p-2 text-[var(--text-secondary)] hover:text-red-500 transition-colors"><Icons.Trash size={18} /></button>
                  </div>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight uppercase italic mb-2">{r.title_pt}</h3>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-6 font-medium italic">{r.description_pt}</p>
                <div className="flex items-center justify-between">
                  <span className="px-4 py-2 bg-[var(--gold)]/10 text-[var(--gold)] text-[10px] font-black rounded-xl border border-[var(--gold)]/20 uppercase tracking-widest">
                    {r.points_required} PONTOS
                  </span>
                  <span className={`px-3 py-1 text-[8px] font-black rounded-full border uppercase tracking-widest ${r.active ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                    {r.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client Points Management */}
        <div className="lg:col-span-4 space-y-8">
          <h2 className="text-xl font-black text-white tracking-widest uppercase italic flex items-center gap-3 mb-6">
            <Icons.Users size={20} className="text-[var(--gold)]" />
            Saldo de Clientes
          </h2>
          
          <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] shadow-2xl sticky top-8">
            <div className="relative mb-6">
              <Icons.Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input 
                type="text" 
                placeholder="BUSCAR CLIENTE..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-4 text-xs font-black tracking-widest uppercase text-white outline-none focus:border-[var(--gold)]"
              />
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredClients.map(c => (
                <div key={c.id} className="p-4 rounded-2xl bg-[var(--bg-main)]/50 border border-[var(--border)] flex items-center justify-between group hover:border-[var(--gold)]/30 transition-all">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-xs font-black text-white uppercase truncate">{c.name}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-bold">{c.loyalty_points || 0} PONTOS</p>
                  </div>
                  <button 
                    onClick={() => { setSelectedClient(c); setPointsForm({ points: 0, reason: '' }); setPointsModal(true); }}
                    className="w-10 h-10 rounded-xl bg-[var(--gold)]/10 text-[var(--gold)] flex items-center justify-center hover:bg-[var(--gold)] hover:text-black transition-all shadow-lg active:scale-90"
                  >
                    <Icons.Plus size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rewards Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setModal(null)}>
          <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
              <h3 className="text-xl font-black text-white uppercase italic">{modal === 'add' ? 'Adicionar' : 'Editar'} Recompensa</h3>
              <button onClick={() => setModal(null)} className="text-[var(--text-secondary)] hover:text-white"><Icons.X size={24} /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[var(--text-secondary)] tracking-widest uppercase">TÍTULO (PT)</label>
                  <input value={form.title_pt} onChange={e => setForm({ ...form, title_pt: e.target.value })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--gold)]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[var(--text-secondary)] tracking-widest uppercase">TÍTULO (EN)</label>
                  <input value={form.title_en} onChange={e => setForm({ ...form, title_en: e.target.value })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--gold)]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[var(--text-secondary)] tracking-widest uppercase">TÍTULO (ES)</label>
                  <input value={form.title_es} onChange={e => setForm({ ...form, title_es: e.target.value })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--gold)]" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[var(--text-secondary)] tracking-widest uppercase">TIPO DE RECOMPENSA</label>
                  <select value={form.reward_type} onChange={e => setForm({ ...form, reward_type: e.target.value })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--gold)]">
                    <option value="service">Serviço Grátis</option>
                    <option value="discount">Desconto em R$</option>
                    <option value="product">Produto / Brinde</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[var(--text-secondary)] tracking-widest uppercase">PONTOS NECESSÁRIOS</label>
                  <input type="number" value={form.points_required} onChange={e => setForm({ ...form, points_required: parseInt(e.target.value) })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--gold)]" />
                </div>
              </div>

              {form.reward_type === 'service' && (
                <div className="space-y-1 animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-black text-[var(--text-secondary)] tracking-widest uppercase">SELECIONAR SERVIÇO</label>
                  <select value={form.service_id || ''} onChange={e => setForm({ ...form, service_id: parseInt(e.target.value) })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--gold)]">
                    <option value="">Selecione um serviço...</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name} (R$ {s.price})</option>)}
                  </select>
                </div>
              )}

              {form.reward_type === 'discount' && (
                <div className="space-y-1 animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-black text-[var(--text-secondary)] tracking-widest uppercase">VALOR DO DESCONTO (R$)</label>
                  <input type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: parseFloat(e.target.value) })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--gold)]" />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-[var(--text-secondary)] tracking-widest uppercase">DESCRIÇÃO (PT)</label>
                <textarea value={form.description_pt} onChange={e => setForm({ ...form, description_pt: e.target.value })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--gold)] h-20 resize-none" />
              </div>

              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl cursor-pointer" onClick={() => setForm({ ...form, active: form.active ? 0 : 1 })}>
                 <div className={`w-10 h-5 rounded-full transition-colors relative ${form.active ? 'bg-green-500' : 'bg-red-500/30'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${form.active ? 'translate-x-6' : 'translate-x-1'}`} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-white">RECOMPENSA ATIVA</span>
              </div>
              <button onClick={handleSave} disabled={saving} className="w-full py-4 bg-[var(--gold)] text-black font-black text-xs tracking-widest uppercase rounded-2xl shadow-xl shadow-[var(--gold)]/20 hover:bg-white transition-all">
                {saving ? 'SALVANDO...' : 'SALVAR RECOMPENSA'}
              </button>
            </div>
          </div>
        </div>
      )}

      {pointsModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setPointsModal(false)}>
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-[var(--border)] flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-white uppercase italic leading-none">AJUSTAR PONTOS</h3>
                <p className="text-[var(--gold)] text-[10px] font-black tracking-widest uppercase mt-2">{selectedClient.name}</p>
              </div>
              <button onClick={() => setPointsModal(false)} className="text-[var(--text-secondary)] hover:text-white"><Icons.X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-secondary)] tracking-widest uppercase ml-1">QUANTIDADE DE PONTOS (±)</label>
                <input 
                  type="number" 
                  value={pointsForm.points} 
                  onChange={e => setPointsForm({ ...pointsForm, points: parseInt(e.target.value) })} 
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl px-6 py-4 text-white font-black text-2xl outline-none focus:border-[var(--gold)]" 
                />
                <p className="text-[8px] text-[var(--text-secondary)] italic ml-1">Use valores negativos para remover pontos.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-secondary)] tracking-widest uppercase ml-1">MOTIVO / DESCRIÇÃO</label>
                <textarea 
                  value={pointsForm.reason} 
                  onChange={e => setPointsForm({ ...pointsForm, reason: e.target.value })} 
                  placeholder="Ex: Bônus especial de boas-vindas"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl px-6 py-4 text-white outline-none focus:border-[var(--gold)] h-24 resize-none italic text-sm" 
                />
              </div>
              <button 
                onClick={handleUpdatePoints} 
                disabled={saving || !pointsForm.reason} 
                className="w-full py-5 bg-[var(--gold)] text-black font-black text-xs tracking-widest uppercase rounded-2xl shadow-xl shadow-[var(--gold)]/20 hover:bg-white transition-all disabled:opacity-50"
              >
                {saving ? 'PROCESSANDO...' : 'ATUALIZAR SALDO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
