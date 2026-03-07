import React, { useEffect, useState } from 'react';
import { Icons } from '../../components/Icons';
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
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title text-3xl text-white">SERVIÇOS</h1>
        <button onClick={openAdd} className="btn-gold px-4 py-2 text-sm flex items-center gap-2">
          <Icons.Plus size={16} /> Adicionar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(s => (
          <div key={s.id} className={`card p-4 ${!s.active ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-[rgba(245,184,0,0.1)] flex items-center justify-center">
                <Icons.Scissors size={22} className="text-[#f5b800]" />
              </div>
              <span className={`badge ${s.active ? 'badge-success' : 'badge-danger'}`}>
                {s.active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <h3 className="font-display font-bold text-white text-lg mb-1">{s.name}</h3>
            {s.description && <p className="text-[#a0a0a0] text-xs mb-2">{s.description}</p>}
            <div className="flex items-center justify-between mb-3">
              <p className="text-[#f5b800] font-bold">R$ {parseFloat(s.price).toFixed(2)}</p>
              <p className="text-[#a0a0a0] text-xs flex items-center gap-1">
                <Icons.Clock size={12} /> {s.duration} min
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(s)} className="flex-1 btn-outline py-1.5 text-xs flex items-center justify-center gap-1">
                <Icons.Edit size={12} /> Editar
              </button>
              {s.active ? (
                <button onClick={() => handleDelete(s.id)} title="Desativar" className="px-2 py-1.5 text-xs border border-[rgba(239,68,68,0.3)] rounded-lg text-red-400 hover:bg-[rgba(239,68,68,0.1)]">
                  <Icons.EyeOff size={12} />
                </button>
              ) : (
                <button onClick={() => handleDelete(s.id, true)} title="Excluir Permanentemente" className="px-2 py-1.5 text-xs bg-red-600 rounded-lg text-white hover:bg-red-700 transition-colors">
                  <Icons.Trash size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {(modal === 'add' || typeof modal === 'number') && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-bold text-white text-xl mb-4">
              {modal === 'add' ? 'ADICIONAR SERVIÇO' : 'EDITAR SERVIÇO'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[#a0a0a0] text-xs mb-1 tracking-widest">NOME</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-dark" placeholder="Nome do serviço" required />
              </div>
              <div>
                <label className="block text-[#a0a0a0] text-xs mb-1 tracking-widest">DESCRIÇÃO</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input-dark h-20 resize-none" placeholder="Descrição do serviço" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a0a0a0] text-xs mb-1 tracking-widest">PREÇO (R$)</label>
                  <input type="number" step="0.01" min="0" value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="input-dark" placeholder="0.00" required />
                </div>
                <div>
                  <label className="block text-[#a0a0a0] text-xs mb-1 tracking-widest">DURAÇÃO (MIN)</label>
                  <select value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })} className="input-dark">
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                    <option value="120">120 min</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[#a0a0a0] text-xs mb-1 tracking-widest">STATUS</label>
                <select value={form.active} onChange={e => setForm({ ...form, active: parseInt(e.target.value) })} className="input-dark">
                  <option value="1">Ativo</option>
                  <option value="0">Inativo</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="btn-outline flex-1 py-2.5 text-sm">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="btn-gold flex-1 py-2.5 text-sm">
                  {saving ? 'Salvando...' : 'SALVAR'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
