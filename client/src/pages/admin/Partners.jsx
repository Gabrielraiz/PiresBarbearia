import React, { useEffect, useState } from 'react';
import Icons from '../../components/Icons';
import api from '../../api';
import { useSettings } from '../../contexts/SettingsContext';

export default function AdminPartners() {
  const { t } = useSettings();
  const [partners, setPartners] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(null);
  
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', description_pt: '', description_en: '', discount_value: 0, discount_type: 'percentage', active: 1 });
  const [saving, setSaving] = useState(false);

  useEffect(() => { 
    loadPartners(); 
    loadClients();
  }, []);

  const loadPartners = () => {
    api.get('/partners/all').then(r => setPartners(r.data));
  };

  const loadClients = () => {
    api.get('/clients').then(r => setClients(r.data));
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const handleAssignPartner = async (clientId, partnerId) => {
    try {
      await api.post(`/clients/${clientId}/partner`, { partner_id: partnerId });
      alert('Parceria vinculada com sucesso!');
      loadClients();
    } catch (err) {
      alert('Erro ao vincular parceria');
    }
  };

  const openAdd = () => { setForm({ name: '', description_pt: '', description_en: '', discount_value: 0, discount_type: 'percentage', active: 1 }); setModal('add'); };
  const openEdit = (p) => { setForm({ ...p }); setModal(p.id); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'add') await api.post('/partners', form);
      else await api.put(`/partners/${modal}`, form);
      loadPartners();
      setModal(null);
    } catch (err) {
      alert('Erro ao salvar parceiro');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Excluir este parceiro?')) return;
    await api.delete(`/partners/${id}`);
    loadPartners();
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none mb-3">GESTÃO DE <span className="text-[var(--gold)]">PARCERIAS</span></h1>
          <p className="text-[var(--text-secondary)] text-xs font-bold tracking-widest uppercase mt-2 italic">Configure benefícios para parceiros e vincule clientes</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-6 py-3 bg-[var(--gold)] text-black font-black text-xs tracking-widest uppercase rounded-2xl hover:bg-white transition-all shadow-xl shadow-[var(--gold)]/20">
          <Icons.Plus size={18} /> NOVO PARCEIRO
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Partners List */}
        <div className="lg:col-span-8 space-y-8">
          <h2 className="text-xl font-black text-white tracking-widest uppercase italic flex items-center gap-3 mb-6">
            <Icons.Handshake size={20} className="text-[var(--gold)]" />
            Nossos Parceiros
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {partners.map(p => (
              <div key={p.id} className={`card p-6 border bg-[var(--bg-card)] rounded-3xl group relative overflow-hidden transition-all hover:border-[var(--gold)]/30 ${selectedPartner?.id === p.id ? 'border-[var(--gold)] ring-2 ring-[var(--gold)]/20' : 'border-[var(--border)]'}`} onClick={() => setSelectedPartner(p)}>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)]">
                    <Icons.Handshake size={24} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); openEdit(p); }} className="p-2 text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors"><Icons.Edit size={18} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="p-2 text-[var(--text-secondary)] hover:text-red-500 transition-colors"><Icons.Trash size={18} /></button>
                  </div>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight uppercase italic mb-2">{p.name}</h3>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-4 italic font-medium">{p.description_pt}</p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[var(--gold)]/10 text-[var(--gold)] text-[10px] font-black rounded-full border border-[var(--gold)]/20 uppercase tracking-widest">
                    {p.discount_type === 'percentage' ? `${p.discount_value}% OFF` : `R$ ${p.discount_value} OFF`}
                  </span>
                  <span className={`px-3 py-1 text-[10px] font-black rounded-full border uppercase tracking-widest ${p.active ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                    {p.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client Linking */}
        <div className="lg:col-span-4 space-y-8">
          <h2 className="text-xl font-black text-white tracking-widest uppercase italic flex items-center gap-3 mb-6">
            <Icons.Users size={20} className="text-[var(--gold)]" />
            Vincular Clientes
          </h2>
          
          <div className="card p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] shadow-2xl sticky top-8">
            {!selectedPartner ? (
              <div className="text-center py-12 px-4 border-2 border-dashed border-[var(--border)] rounded-2xl">
                <Icons.Handshake size={48} className="mx-auto text-[var(--text-secondary)] opacity-20 mb-4" />
                <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest leading-relaxed">Selecione um parceiro ao lado para vincular clientes</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[8px] font-black text-[var(--gold)] tracking-widest uppercase italic">VINCULANDO A</p>
                    <p className="text-xs font-black text-white uppercase italic">{selectedPartner.name}</p>
                  </div>
                  <button onClick={() => setSelectedPartner(null)} className="text-[var(--text-secondary)] hover:text-red-500 transition-colors"><Icons.X size={16} /></button>
                </div>

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

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredClients.map(c => {
                    const isLinked = c.partner_id === selectedPartner.id;
                    return (
                      <div key={c.id} className={`p-4 rounded-2xl bg-[var(--bg-main)]/50 border flex items-center justify-between group transition-all ${isLinked ? 'border-green-500/30' : 'border-[var(--border)] hover:border-[var(--gold)]/30'}`}>
                        <div className="flex-1 min-w-0 mr-4">
                          <p className="text-xs font-black text-white uppercase truncate">{c.name}</p>
                          <p className="text-[8px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">
                            {c.partner_id ? (isLinked ? 'JÁ VINCULADO' : `VINCULADO A ID: ${c.partner_id}`) : 'SEM PARCERIA'}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleAssignPartner(c.id, isLinked ? null : selectedPartner.id)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-90 ${isLinked ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-[var(--gold)]/10 text-[var(--gold)] hover:bg-[var(--gold)] hover:text-black'}`}
                        >
                          {isLinked ? <Icons.X size={18} /> : <Icons.Plus size={18} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setModal(null)}>
          <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
              <h3 className="text-xl font-black text-white uppercase italic">{modal === 'add' ? 'Adicionar' : 'Editar'} Parceiro</h3>
              <button onClick={() => setModal(null)} className="text-[var(--text-secondary)] hover:text-white"><Icons.X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[var(--text-secondary)] tracking-widest uppercase">NOME DO PARCEIRO</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--gold)]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[var(--text-secondary)] tracking-widest uppercase">VALOR DESCONTO</label>
                  <input type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: parseFloat(e.target.value) })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--gold)]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[var(--text-secondary)] tracking-widest uppercase">TIPO</label>
                  <select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--gold)]">
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[var(--text-secondary)] tracking-widest uppercase">DESCRIÇÃO (PT)</label>
                <textarea value={form.description_pt} onChange={e => setForm({ ...form, description_pt: e.target.value })} className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--gold)] h-24 resize-none" />
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl cursor-pointer" onClick={() => setForm({ ...form, active: form.active ? 0 : 1 })}>
                 <div className={`w-10 h-5 rounded-full transition-colors relative ${form.active ? 'bg-green-500' : 'bg-red-500/30'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${form.active ? 'translate-x-6' : 'translate-x-1'}`} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-white">PARCEIRO ATIVO</span>
              </div>
              <button onClick={handleSave} disabled={saving} className="w-full py-4 bg-[var(--gold)] text-black font-black text-xs tracking-widest uppercase rounded-2xl shadow-xl shadow-[var(--gold)]/20 hover:bg-white transition-all">
                {saving ? 'SALVANDO...' : 'SALVAR PARCEIRO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
